import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';

import { Rule } from '../domain/rule.entity';
import { LeadSending, LeadSendingStatus } from '../domain/lead-sending.entity';
import { ExternalApiService, Lead } from './external-api.service';
import { RulesUtilsService } from './rules-utils.service';

interface ScheduledTimeout {
  timeoutId: NodeJS.Timeout;
  ruleId: string;
  leadSubid: string;
  scheduleTime: number;
  createdAt: number;
}

@Injectable()
export class LeadSchedulingService {
  private readonly logger = new Logger(LeadSchedulingService.name);
  private readonly activeExecutions = new Set<string>(); // Track active rule executions
  private readonly scheduledTimeouts = new Map<string, ScheduledTimeout[]>(); // ruleId -> timeout[]

  constructor(
    @InjectRepository(Rule) private readonly ruleRepo: Repository<Rule>,
    @InjectRepository(LeadSending)
    private readonly leadSendingRepo: Repository<LeadSending>,
    private readonly externalApi: ExternalApiService,
    private readonly utils: RulesUtilsService,
  ) {}

  async scheduleLeadsSending(rule: Rule): Promise<void> {
    // Check for concurrent execution
    if (this.activeExecutions.has(rule.id)) {
      this.logger.warn(
        `Rule ${rule.id} (${rule.name}) is already being executed, skipping to prevent duplicate scheduling`,
      );
      return;
    }

    // Mark rule as being executed
    this.activeExecutions.add(rule.id);

    try {
      this.logger.log(
        `scheduleLeadsSending: Starting for rule ${rule.id} (${rule.name})`,
      );
      this.logger.log(
        `Rule config: isActive=${rule.isActive}, isInfinite=${rule.isInfinite}, dailyCapLimit=${rule.dailyCapLimit}`,
      );

      if (!rule.isActive) {
        this.logger.log(`rule ${rule.id} paused — skip`);
        return;
      }

      // 1) Get leads from the external API
      this.logger.log(`Fetching leads for rule ${rule.id}...`);
      const leads = await this.fetchLeadsForRule(rule);
      this.logger.log(`Fetched ${leads.length} leads for rule ${rule.id}`);

      if (!leads.length) {
        this.logger.warn(`rule ${rule.id}: no leads to send - CHECK FILTERS!`);
        return;
      }

      // Use dailyCapLimit directly - it's guaranteed to be a valid number from DB (has default: 100)
      const effectiveDailyLimit = rule.isInfinite
        ? leads.length
        : rule.dailyCapLimit;

      const toSend = leads.slice(0, effectiveDailyLimit);

      this.logger.log(
        `Scheduling strategy: dailyLimit=${effectiveDailyLimit}, availableLeads=${toSend.length}, intervals=${rule.minIntervalMinutes}-${rule.maxIntervalMinutes}min, infinite=${rule.isInfinite}`,
      );

      // 2) Define the send time window
      const { windowStart, windowEnd } = this.calculateTimeWindow(rule);
      if (windowEnd <= windowStart && !rule.isInfinite) {
        this.logger.warn(
          `rule ${rule.id}: empty/inverted window - will schedule what fits`,
        );
        // Don't return - still try to schedule leads, they might fit
      }

      // 3) Plan sending leads with intervals
      this.scheduleLeadsWithIntervals(rule.id, toSend, windowStart, rule);

      this.logger.log(
        `rule ${rule.id}: scheduled ${toSend.length} leads${rule.isInfinite ? ' (infinite mode)' : ''} - first lead at ${new Date(windowStart).toLocaleString()}`,
      );
    } finally {
      // Always remove from active executions
      this.activeExecutions.delete(rule.id);
      this.logger.debug(
        `Rule ${rule.id} execution completed, removed from active executions`,
      );
    }
  }

  private async fetchLeadsForRule(rule: Rule): Promise<Lead[]> {
    // 1) Build filters for the lead request
    // Use dailyCapLimit directly - it's guaranteed to be a valid number from DB (has default: 100)
    const limit = rule.isInfinite ? 999999 : rule.dailyCapLimit;
    const filters = {
      limit,
      // DO NOT SEARCH by targetProductName - this is the target product where we send
      // Search leads by lead filters (where we get them)
      ...(rule.leadVertical ? { vertical: rule.leadVertical } : {}),
      ...(rule.leadCountry ? { country: rule.leadCountry } : {}),
      ...(rule.leadStatus && rule.leadStatus !== 'ALL'
        ? { status: rule.leadStatus }
        : {}),
      ...(rule.leadAffiliate ? { aff: rule.leadAffiliate } : {}),
      ...(rule.leadDateFrom ? { date_from: rule.leadDateFrom } : {}),
      ...(rule.leadDateTo ? { date_to: rule.leadDateTo } : {}),
    };

    try {
      let raw = await this.externalApi.getLeads(filters);

      // If the filtered leads are empty — make a fallback without filters or by vertical
      if (
        raw.length === 0 &&
        (rule.leadVertical ||
          rule.leadCountry ||
          (rule.leadStatus && rule.leadStatus !== 'ALL') ||
          rule.leadAffiliate ||
          rule.leadDateFrom ||
          rule.leadDateTo)
      ) {
        this.logger.warn(
          `rule ${rule.id}: empty by filters, fallback request with relaxed filters`,
        );
        // Fallback: use only vertical or no filters at all
        // Keep the same limit logic for consistency
        const fallbackFilters = {
          limit,
          ...(rule.leadVertical ? { vertical: rule.leadVertical } : {}),
        };
        raw = await this.externalApi.getLeads(fallbackFilters);
      }

      // Normalization and local filters (offerId/dailyCapLimit)
      this.logger.log(
        `About to normalize ${raw.length} raw leads for rule ${rule.id}`,
      );
      const normalizedLeads = this.normalizeAndFilterLeads(raw, rule);
      this.logger.log(
        `After normalization: ${normalizedLeads.length} leads for rule ${rule.id}`,
      );
      return normalizedLeads;
    } catch (error) {
      this.logger.error(`Failed to fetch leads for rule ${rule.id}:`, error);
      return [];
    }
  }

  private normalizeAndFilterLeads(rawLeads: any[], rule: Rule): Lead[] {
    this.logger.log(
      `normalizeAndFilterLeads: Processing ${rawLeads.length} raw leads for rule ${rule.id}`,
    );

    let filteredCount = 0;
    let noSubidCount = 0;
    let verticalMismatchCount = 0;
    let countryMismatchCount = 0;
    let affiliateMismatchCount = 0;
    let statusMismatchCount = 0;
    let redirectsLimitCount = 0;

    const filtered = rawLeads
      .filter((r) => {
        const sid = this.utils.getField(r, 'subid', 'subId', 'sub_id');
        const pid = this.utils.getField(
          r,
          'productId',
          'product_id',
          'product',
        );
        if (!sid || !pid) {
          noSubidCount++;
          return false;
        }

        // DO NOT filter by targetProductId - leads can be from any product
        // targetProductId is where we redirect, not where we get leads
        // Leads are filtered by leadVertical, leadCountry, leadStatus, leadAffiliate

        // Match vertical if specified in rule
        if (rule.leadVertical) {
          const leadVertical = String(r.vertical || '');
          if (leadVertical !== rule.leadVertical) {
            verticalMismatchCount++;
            return false;
          }
        }

        // Match country if specified in rule
        if (rule.leadCountry) {
          const leadCountry = String(r.country || '').toUpperCase();
          const ruleCountry = String(rule.leadCountry).toUpperCase();
          if (leadCountry !== ruleCountry) {
            countryMismatchCount++;
            return false;
          }
        }

        // Match affiliate if specified in rule
        if (rule.leadAffiliate) {
          const leadAff = String(r.aff || r.affiliate || '');
          if (leadAff !== rule.leadAffiliate) {
            affiliateMismatchCount++;
            return false;
          }
        }

        // Match status if specified in rule and not "ALL"
        if (rule.leadStatus && rule.leadStatus !== 'ALL') {
          const leadStatus = String(r.status || '');
          if (leadStatus !== rule.leadStatus) {
            statusMismatchCount++;
            return false;
          }
        }

        // Check the cap only if not infinite sending
        if (!rule.isInfinite) {
          const redirects =
            r.redirects ?? r.redirects_count ?? r.redirectsCount;
          if (
            typeof redirects === 'number' &&
            typeof rule.dailyCapLimit === 'number' &&
            redirects > rule.dailyCapLimit
          ) {
            redirectsLimitCount++;
            return false;
          }
        }
        filteredCount++;
        return true;
      })
      .map<Lead>((r) => {
        const sid = this.utils.getField(r, 'subid', 'subId', 'sub_id')!;
        const pid = this.utils.getField(
          r,
          'productId',
          'product_id',
          'product',
        )!;
        const pnm =
          this.utils.getField(r, 'productName', 'product_name', 'product') ??
          '';
        const name =
          (r.leadName ?? r.name ?? '').toString().trim() || 'Unknown';

        return {
          subid: sid,
          productId: pid,
          productName: pnm,
          aff: (r.aff ?? r.affiliate ?? '').toString(),
          country: (r.country ?? '').toString() || undefined,
          vertical: (r.vertical ?? '').toString() || undefined,
          status: (r.status ?? '').toString() || undefined,
          leadName: name,
          phone: (r.phone ?? '').toString() || undefined,
          email: (r.email ?? '').toString() || undefined,
          ip: (r.ip ?? '').toString() || undefined,
          ua: (r.ua ?? '').toString() || undefined,
          redirects: typeof r.redirects === 'number' ? r.redirects : undefined,
          date: (r.date ?? r.created_at ?? '').toString() || undefined,
        };
      });

    // Log the filtering statistics
    this.logger.log(`📊 Filtering stats for rule ${rule.id}:`);
    this.logger.log(`📥 Raw leads received: ${rawLeads.length}`);
    this.logger.log(`✅ Leads passed filters: ${filteredCount}`);
    this.logger.log(`🚫 No subid/productId: ${noSubidCount}`);
    this.logger.log(`🚫 Vertical mismatch: ${verticalMismatchCount}`);
    this.logger.log(`🚫 Country mismatch: ${countryMismatchCount}`);
    this.logger.log(`🚫 Affiliate mismatch: ${affiliateMismatchCount}`);
    this.logger.log(`🚫 Status mismatch: ${statusMismatchCount}`);
    this.logger.log(`🚫 Redirects limit: ${redirectsLimitCount}`);
    this.logger.log(`📤 Final leads to send: ${filtered.length}`);

    return filtered;
  }

  private calculateTimeWindow(rule: Rule): {
    windowStart: number;
    windowEnd: number;
  } {
    if (rule.isInfinite) {
      // For infinite sending, use current time as the window start
      return {
        windowStart: Date.now(),
        windowEnd: Date.now() + 24 * 60 * 60 * 1000, // +24 hours
      };
    }

    // For normal sending, check the time window
    if (!rule.sendWindowStart || !rule.sendWindowEnd) {
      throw new Error(`Missing time window for non-infinite rule ${rule.id}`);
    }

    let sh: number, sm: number, eh: number, em: number;
    try {
      [sh, sm] = this.utils.parseTimeHM(rule.sendWindowStart);
      [eh, em] = this.utils.parseTimeHM(rule.sendWindowEnd);
    } catch (e: any) {
      throw new Error(`Invalid window for rule ${rule.id}: ${e?.message || e}`);
    }

    return {
      windowStart: this.utils.getTodayTimestamp(sh, sm),
      windowEnd: this.utils.getTodayTimestamp(eh, em),
    };
  }

  private scheduleLeadsWithIntervals(
    ruleId: string,
    leads: Lead[],
    windowStart: number,
    rule: Rule,
  ): void {
    this.logger.log(
      `Scheduling ${leads.length} leads with intervals ${rule.minIntervalMinutes}-${rule.maxIntervalMinutes} minutes for rule ${ruleId}`,
    );

    const { windowEnd } = this.calculateTimeWindow(rule);
    let currentScheduleTime = windowStart;
    let leadsScheduled = 0;
    let leadsSkipped = 0;
    const ruleTimeouts: ScheduledTimeout[] = [];

    // Pre-calculate schedule times and filter out leads that exceed the window
    const scheduledLeads: Array<{
      lead: Lead;
      scheduleTime: number;
      index: number;
    }> = [];

    for (let index = 0; index < leads.length; index++) {
      const lead = leads[index];

      // For the first lead, schedule immediately at windowStart
      // For subsequent leads, add random interval from previous lead
      if (index > 0) {
        const intervalMinutes = this.utils.randomInRange(
          rule.minIntervalMinutes,
          rule.maxIntervalMinutes,
        );
        currentScheduleTime += intervalMinutes * 60_000; // Add interval in milliseconds
      }

      // Check if the scheduled time exceeds the time window (only for non-infinite rules)
      if (!rule.isInfinite && currentScheduleTime > windowEnd) {
        this.logger.warn(
          `Lead ${index + 1}/${leads.length} (${lead.subid}) skipped - would exceed time window. Scheduled: ${new Date(currentScheduleTime).toLocaleTimeString()}, Window ends: ${new Date(windowEnd).toLocaleTimeString()}`,
        );
        leadsSkipped++;
        // Break the loop to prevent all subsequent leads from being skipped
        break;
      }

      scheduledLeads.push({ lead, scheduleTime: currentScheduleTime, index });
    }

    // Schedule the filtered leads
    scheduledLeads.forEach(({ lead, scheduleTime, index }) => {
      const delay = Math.max(scheduleTime - Date.now(), 0);
      const scheduleDate = new Date(scheduleTime);

      this.logger.log(
        `Lead ${index + 1}/${leads.length} (${lead.subid}) scheduled for ${scheduleDate.toLocaleTimeString()} (in ${Math.round(delay / 1000 / 60)} minutes)`,
      );

      const timeoutId = setTimeout(() => {
        this.logger.log(
          `Sending lead ${index + 1}/${leads.length} (${lead.subid}) for rule ${ruleId}`,
        );

        // Remove this timeout from tracking when it executes
        this.removeTimeoutFromTracking(ruleId, lead.subid);

        this.sendOneLead(ruleId, lead).catch((err) =>
          this.logger.error(
            `rule ${ruleId}: send ${lead.subid} error: ${err?.message || err}`,
          ),
        );
      }, delay);

      // Track this timeout for potential cleanup
      const scheduledTimeout: ScheduledTimeout = {
        timeoutId,
        ruleId,
        leadSubid: lead.subid,
        scheduleTime,
        createdAt: Date.now(),
      };

      ruleTimeouts.push(scheduledTimeout);
      leadsScheduled++;
    });

    // Log final schedule summary
    const lastScheduleTime =
      scheduledLeads.length > 0
        ? new Date(scheduledLeads[scheduledLeads.length - 1].scheduleTime)
        : new Date(windowStart);
    const totalDuration =
      scheduledLeads.length > 0
        ? Math.round(
            (scheduledLeads[scheduledLeads.length - 1].scheduleTime -
              windowStart) /
              1000 /
              60,
          )
        : 0;

    this.logger.log(
      `Rule ${ruleId}: ${leadsScheduled} leads scheduled successfully, ${leadsSkipped} skipped (time window constraint). Last lead at ${lastScheduleTime.toLocaleTimeString()} (total duration: ${totalDuration} minutes)`,
    );

    if (leadsSkipped > 0 && !rule.isInfinite) {
      const windowDuration = Math.round((windowEnd - windowStart) / 1000 / 60);
      const avgInterval =
        (rule.minIntervalMinutes + rule.maxIntervalMinutes) / 2;
      this.logger.log(
        `Time window analysis for rule ${ruleId}: Window=${windowDuration}min, AvgInterval=${avgInterval}min, Capacity=~${Math.floor(windowDuration / avgInterval) + 1} leads. ${leadsSkipped} leads skipped due to time constraints (this is normal behavior).`,
      );
    }

    // Store timeouts for cleanup capability
    if (ruleTimeouts.length > 0) {
      this.scheduledTimeouts.set(ruleId, [
        ...(this.scheduledTimeouts.get(ruleId) || []),
        ...ruleTimeouts,
      ]);

      this.logger.log(
        `Rule ${ruleId}: Created ${ruleTimeouts.length} scheduled timeouts (total tracked: ${this.scheduledTimeouts.get(ruleId)?.length || 0})`,
      );
    }
  }

  private async sendOneLead(ruleId: string, lead: Lead): Promise<void> {
    // Get the rule for access to the target product
    const rule = await this.ruleRepo.findOneBy({ id: ruleId });
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found for lead sending`);
    }

    // New logic: create a payload with the target product according to the API schema
    const payload = {
      // Lead data (where we get them) - only fields from the LeadToAdd schema
      subid: lead.subid,
      leadName: lead.leadName ?? '',
      phone: lead.phone ?? '',
      ip: lead.ip ?? '',
      ua: lead.ua ?? '',
      // DO NOT send email and status - they are not in the API schema

      // Target product (where we send) - fields from the Product schema
      productId: rule.targetProductId,
      productName: rule.targetProductName,
      vertical: rule.targetProductVertical || rule.leadVertical || '',
      country: rule.targetProductCountry || rule.leadCountry || '',
      aff: rule.targetProductAffiliate || rule.leadAffiliate || '',
    };

    try {
      const result = await this.externalApi.addLead(payload);

      const ok = this.leadSendingRepo.create({
        ruleId,
        leadSubid: lead.subid, // Fixed: leadSubid instead of subid
        leadName: lead.leadName || '',
        leadPhone: lead.phone || '',
        leadEmail: lead.email || undefined,
        leadCountry: lead.country || undefined,
        targetProductId: rule.targetProductId,
        targetProductName: rule.targetProductName,
        status: LeadSendingStatus.SUCCESS,
        responseStatus: result.status,
      } as DeepPartial<LeadSending>);
      await this.leadSendingRepo.save(ok);

      // Safe logging of successful sending
      this.logger.log(
        `rule ${ruleId}: lead sent successfully (HTTP ${result.status})`,
      );
    } catch (err: any) {
      const status = err?.response?.status;
      const details = err?.response?.data ?? err?.message ?? err;

      const fail = this.leadSendingRepo.create({
        ruleId,
        leadSubid: lead.subid, // Fixed: leadSubid instead of subid
        leadName: lead.leadName || '',
        leadPhone: lead.phone || '',
        leadEmail: lead.email || undefined,
        leadCountry: lead.country || undefined,
        targetProductId: rule.targetProductId,
        targetProductName: rule.targetProductName,
        status: LeadSendingStatus.ERROR,
        responseStatus: status,
        errorDetails: this.utils.stringify(details),
      } as DeepPartial<LeadSending>);
      await this.leadSendingRepo.save(fail);

      // Safe logging of errors
      const safeDetails =
        details && typeof details === 'object' && details.message
          ? details.message
          : 'Lead sending failed';
      this.logger.error(
        `rule ${ruleId}: lead sending failed (HTTP ${status ?? 'unknown'}) - ${safeDetails}`,
      );
    }
  }

  async planNextDay(ruleId: string): Promise<void> {
    const rule = await this.ruleRepo.findOneBy({ id: ruleId });
    if (!rule) return;

    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const delay = nextMidnight.getTime() - now.getTime();

    setTimeout(
      async () => {
        const r = await this.ruleRepo.findOneBy({ id: ruleId });
        if (!r || !r.isActive) return;
        await this.scheduleLeadsSending(r);
        this.planNextDay(ruleId).catch(() => {});
      },
      Math.max(delay, 0),
    );
  }

  async manualTriggerRule(ruleId: string): Promise<{
    ruleId: string;
    ruleName: string;
    triggered: boolean;
    timestamp: string;
    message: string;
  }> {
    const rule = await this.ruleRepo.findOneBy({ id: ruleId });
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    this.logger.log(`Manually triggering rule ${ruleId}: ${rule.name}`);

    // Start the lead sending process
    await this.scheduleLeadsSending(rule);

    return {
      ruleId,
      ruleName: rule.name,
      triggered: true,
      timestamp: new Date().toISOString(),
      message: 'Rule execution started manually',
    };
  }

  /**
   * Cancel all scheduled timeouts for a specific rule
   * Useful when deactivating a rule or stopping lead sending
   */
  cancelScheduledLeads(ruleId: string): {
    ruleId: string;
    cancelledCount: number;
    message: string;
  } {
    const timeouts = this.scheduledTimeouts.get(ruleId);

    if (!timeouts || timeouts.length === 0) {
      this.logger.log(`No scheduled timeouts found for rule ${ruleId}`);
      return {
        ruleId,
        cancelledCount: 0,
        message: 'No scheduled leads to cancel',
      };
    }

    let cancelledCount = 0;
    const now = Date.now();

    // Cancel all pending timeouts
    timeouts.forEach((scheduledTimeout) => {
      // Only cancel if the timeout hasn't executed yet
      if (scheduledTimeout.scheduleTime > now) {
        clearTimeout(scheduledTimeout.timeoutId);
        cancelledCount++;
        this.logger.debug(
          `Cancelled timeout for rule ${ruleId}, lead ${scheduledTimeout.leadSubid}`,
        );
      }
    });

    // Remove all timeouts for this rule
    this.scheduledTimeouts.delete(ruleId);

    this.logger.log(
      `Rule ${ruleId}: Cancelled ${cancelledCount} scheduled lead timeouts`,
    );

    return {
      ruleId,
      cancelledCount,
      message: `Cancelled ${cancelledCount} scheduled leads`,
    };
  }

  /**
   * Clean up expired timeouts and remove executed ones from tracking
   */
  private removeTimeoutFromTracking(ruleId: string, leadSubid: string): void {
    const timeouts = this.scheduledTimeouts.get(ruleId);
    if (!timeouts) return;

    const updatedTimeouts = timeouts.filter(
      (timeout) => timeout.leadSubid !== leadSubid,
    );

    if (updatedTimeouts.length === 0) {
      this.scheduledTimeouts.delete(ruleId);
    } else {
      this.scheduledTimeouts.set(ruleId, updatedTimeouts);
    }
  }

  /**
   * Get status of scheduled timeouts for a rule
   */
  getScheduledLeadsStatus(ruleId: string): {
    ruleId: string;
    totalScheduled: number;
    pendingCount: number;
    nextScheduleTime?: string;
    timeouts: Array<{
      leadSubid: string;
      scheduleTime: string;
      delayMinutes: number;
      isPending: boolean;
    }>;
  } {
    const timeouts = this.scheduledTimeouts.get(ruleId) || [];
    const now = Date.now();

    const timeoutDetails = timeouts.map((timeout) => ({
      leadSubid: timeout.leadSubid,
      scheduleTime: new Date(timeout.scheduleTime).toISOString(),
      delayMinutes: Math.round((timeout.scheduleTime - now) / 1000 / 60),
      isPending: timeout.scheduleTime > now,
    }));

    const pendingTimeouts = timeoutDetails.filter((t) => t.isPending);
    const nextTimeout = pendingTimeouts.sort(
      (a, b) => a.delayMinutes - b.delayMinutes,
    )[0];

    return {
      ruleId,
      totalScheduled: timeouts.length,
      pendingCount: pendingTimeouts.length,
      nextScheduleTime: nextTimeout?.scheduleTime,
      timeouts: timeoutDetails,
    };
  }

  /**
   * Clean up old/expired timeouts periodically to prevent memory leaks
   */
  cleanupExpiredTimeouts(): void {
    const now = Date.now();
    const expiredThreshold = 24 * 60 * 60 * 1000; // 24 hours
    let totalCleaned = 0;

    for (const [ruleId, timeouts] of this.scheduledTimeouts.entries()) {
      const validTimeouts = timeouts.filter((timeout) => {
        const isExpired = now - timeout.createdAt > expiredThreshold;
        const isExecuted = timeout.scheduleTime <= now;

        if (isExpired || isExecuted) {
          totalCleaned++;
          return false;
        }
        return true;
      });

      if (validTimeouts.length === 0) {
        this.scheduledTimeouts.delete(ruleId);
      } else if (validTimeouts.length !== timeouts.length) {
        this.scheduledTimeouts.set(ruleId, validTimeouts);
      }
    }

    if (totalCleaned > 0) {
      this.logger.log(`Cleaned up ${totalCleaned} expired/executed timeouts`);
    }
  }
}
