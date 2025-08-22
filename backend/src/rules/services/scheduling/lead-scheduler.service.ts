import { Injectable, Logger } from '@nestjs/common';
import { Rule } from '../../domain/rule.entity';
import { Lead } from '../external-api.service';
import { RulesUtilsService } from '../rules-utils.service';
import { TimeoutManagerService } from './timeout-manager.service';
import { ScheduledTimeout } from './types';

/**
 * Service responsible for scheduling leads with intervals
 * Handles the logic of when and how leads should be sent
 */
@Injectable()
export class LeadSchedulerService {
  private readonly logger = new Logger(LeadSchedulerService.name);

  constructor(
    private readonly utils: RulesUtilsService,
    private readonly timeoutManager: TimeoutManagerService,
  ) {}

  /**
   * Schedule leads with random intervals within the specified time window
   */
  scheduleLeadsWithIntervals(
    ruleId: string,
    leads: Lead[],
    windowStart: number,
    rule: Rule,
    onLeadSend: (ruleId: string, lead: Lead) => Promise<void>,
  ): void {
    this.logger.log(
      `Scheduling ${leads.length} leads with intervals ${rule.minIntervalMinutes}-${rule.maxIntervalMinutes} minutes for rule ${ruleId}`,
    );

    const { windowEnd } = this.calculateTimeWindow(rule);
    let currentScheduleTime = windowStart;
    let leadsScheduled = 0;
    let leadsSkipped = 0;

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
        this.timeoutManager.removeTimeoutFromTracking(ruleId, lead.subid);

        onLeadSend(ruleId, lead).catch((err) =>
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

      this.timeoutManager.addScheduledTimeout(scheduledTimeout);
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
  }

  /**
   * Calculate time window for rule execution
   */
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
}
