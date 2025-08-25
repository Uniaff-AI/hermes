import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';

import { Rule } from '../domain/rule.entity';
import { LeadSending, LeadSendingStatus } from '../domain/lead-sending.entity';
import { ExternalApiService, Lead } from './external-api.service';
import { RulesUtilsService } from './rules-utils.service';
import { TimeoutManagerService } from './scheduling/timeout-manager.service';
import { LeadSchedulerService } from './scheduling/lead-scheduler.service';
import { LeadFetcherService } from './scheduling/lead-fetcher.service';
import { TriggerResult } from './scheduling/types';

/**
 * Main Lead Scheduling Service - Refactored
 * Orchestrates lead fetching, scheduling, and sending operations
 * Delegates specific responsibilities to specialized services
 */
@Injectable()
export class LeadSchedulingService {
  private readonly logger = new Logger(LeadSchedulingService.name);
  private readonly activeExecutions = new Set<string>(); // Track active rule executions

  // Track currently sending leads to prevent parallel sends
  private readonly activeSending = new Set<string>();

  constructor(
    @InjectRepository(Rule) private readonly ruleRepo: Repository<Rule>,
    @InjectRepository(LeadSending)
    private readonly leadSendingRepo: Repository<LeadSending>,
    private readonly externalApi: ExternalApiService,
    private readonly utils: RulesUtilsService,
    private readonly timeoutManager: TimeoutManagerService,
    private readonly leadScheduler: LeadSchedulerService,
    private readonly leadFetcher: LeadFetcherService,
  ) {}

  /**
   * Main method for scheduling leads sending for a rule
   * Prevents batch sending through execution locking
   */
  async scheduleLeadsSending(rule: Rule): Promise<void> {
    // Check for concurrent execution - CRITICAL for preventing batch sending
    if (this.activeExecutions.has(rule.id)) {
      this.logger.warn(
        `BATCH PREVENTION: Rule ${rule.id} (${rule.name}) is already being executed, skipping to prevent duplicate scheduling`,
      );
      return;
    }

    // Mark rule as being executed - prevents parallel executions that cause batch sending
    this.activeExecutions.add(rule.id);
    this.logger.log(
      `EXECUTION LOCK: Rule ${rule.id} locked for sequential processing`,
    );

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

      // 1) Get leads from the external API using dedicated fetcher service
      this.logger.log(`Fetching leads for rule ${rule.id}...`);
      const leads = await this.leadFetcher.fetchLeadsForRule(rule);
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

      // 2) Define the send time window (using current time for infinite, rule window for finite)
      let windowStart: number;
      let windowEnd: number;

      if (rule.isInfinite) {
        windowStart = Date.now();
        windowEnd = Date.now() + 24 * 60 * 60 * 1000;
      } else {
        // Calculate the intended window times
        const intendedStart = this.utils.getTodayTimestamp(
          ...this.utils.parseTimeHM(rule.sendWindowStart || '00:00'),
        );
        const intendedEnd = this.utils.getTodayTimestamp(
          ...this.utils.parseTimeHM(rule.sendWindowEnd || '23:59'),
        );

        const now = Date.now();

        // If the window start time is in the past, schedule for tomorrow
        if (intendedStart < now) {
          this.logger.warn(
            `Rule ${rule.id}: Window start time (${new Date(intendedStart).toLocaleString()}) is in the past. Scheduling for tomorrow at the same time.`,
          );

          // Calculate tomorrow's timestamp at the same time
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(
            parseInt(rule.sendWindowStart?.split(':')[0] || '0'),
            parseInt(rule.sendWindowStart?.split(':')[1] || '0'),
            0,
            0,
          );

          const tomorrowEnd = new Date();
          tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
          tomorrowEnd.setHours(
            parseInt(rule.sendWindowEnd?.split(':')[0] || '23'),
            parseInt(rule.sendWindowEnd?.split(':')[1] || '59'),
            0,
            0,
          );

          windowStart = tomorrow.getTime();
          windowEnd = tomorrowEnd.getTime();
        } else {
          windowStart = intendedStart;
          windowEnd = intendedEnd;
        }
      }

      if (windowEnd <= windowStart && !rule.isInfinite) {
        this.logger.warn(
          `rule ${rule.id}: empty/inverted window - will schedule what fits`,
        );
        // Don't return - still try to schedule leads, they might fit
      }

      // 3) Plan sending leads with intervals using dedicated scheduler service
      this.logger.log(
        `Rule ${rule.id}: Final window: ${new Date(windowStart).toLocaleString()} - ${new Date(windowEnd).toLocaleString()} (duration: ${Math.round((windowEnd - windowStart) / 1000 / 60)} minutes)`,
      );

      this.leadScheduler.scheduleLeadsWithIntervals(
        rule.id,
        toSend,
        windowStart,
        rule,
        this.sendOneLead.bind(this),
      );

      this.logger.log(
        `rule ${rule.id}: scheduled ${toSend.length} leads${rule.isInfinite ? ' (infinite mode)' : ''} - first lead at ${new Date(windowStart).toLocaleString()}`,
      );
    } finally {
      // Always remove from active executions - unlock for future sequential processing
      this.activeExecutions.delete(rule.id);
      this.logger.log(
        `EXECUTION UNLOCK: Rule ${rule.id} execution completed, removed from active executions`,
      );
    }
  }

  /**
   * Send a single lead to the external API
   * Called by the scheduler service when it's time to send a lead
   * CRITICAL: Includes protection against parallel sending
   */
  private async sendOneLead(ruleId: string, lead: Lead): Promise<void> {
    const leadKey = `${ruleId}:${lead.subid}`;

    // CRITICAL: Prevent parallel sending of the same lead
    if (this.activeSending.has(leadKey)) {
      this.logger.warn(
        `BATCH PREVENTION: Lead ${lead.subid} for rule ${ruleId} is already being sent, skipping duplicate`,
      );
      return;
    }

    // Mark lead as being sent
    this.activeSending.add(leadKey);
    this.logger.log(
      `SEND LOCK: Lead ${lead.subid} locked for sending to prevent duplicates`,
    );

    // Get the rule for access to the target product
    const rule = await this.ruleRepo.findOneBy({ id: ruleId });
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found for lead sending`);
    }

    try {
      // Create a payload with the target product according to the API schema
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

      const result = await this.externalApi.addLead(payload);

      const ok = this.leadSendingRepo.create({
        ruleId,
        leadSubid: lead.subid,
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
        leadSubid: lead.subid,
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
    } finally {
      // CRITICAL: Always unlock the lead sending to prevent permanent locks
      this.activeSending.delete(leadKey);
      this.logger.log(
        `🔓 SEND UNLOCK: Lead ${lead.subid} unlocked after sending attempt`,
      );
    }
  }

  /**
   * Plan next day scheduling for a rule
   */
  public async planNextDay(ruleId: string): Promise<void> {
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

  /**
   * Manually trigger rule execution
   */
  async manualTriggerRule(ruleId: string): Promise<TriggerResult> {
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
   * Cancel scheduled leads for a rule (delegated to timeout manager)
   */
  cancelScheduledLeads(ruleId: string) {
    return this.timeoutManager.cancelScheduledLeads(ruleId);
  }

  /**
   * Get scheduled leads status for a rule (delegated to timeout manager)
   */
  getScheduledLeadsStatus(ruleId: string) {
    return this.timeoutManager.getScheduledLeadsStatus(ruleId);
  }

  /**
   * Clean up expired timeouts (delegated to timeout manager)
   */
  cleanupExpiredTimeouts(): void {
    this.timeoutManager.cleanupExpiredTimeouts();
  }
}
