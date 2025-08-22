import { Injectable, Logger } from '@nestjs/common';
import { ScheduledTimeout, ScheduledLeadsStatus, CancelResult } from './types';

/**
 * Service responsible for managing scheduled timeouts for leads
 * Handles timeout tracking, cancellation, and status reporting
 */
@Injectable()
export class TimeoutManagerService {
  private readonly logger = new Logger(TimeoutManagerService.name);
  private readonly scheduledTimeouts = new Map<string, ScheduledTimeout[]>(); // ruleId -> timeout[]

  /**
   * Add scheduled timeout to tracking
   */
  addScheduledTimeout(timeout: ScheduledTimeout): void {
    const ruleTimeouts = this.scheduledTimeouts.get(timeout.ruleId) || [];
    ruleTimeouts.push(timeout);
    this.scheduledTimeouts.set(timeout.ruleId, ruleTimeouts);

    this.logger.debug(
      `Added timeout for rule ${timeout.ruleId}, lead ${timeout.leadSubid}. Total tracked: ${ruleTimeouts.length}`,
    );
  }

  /**
   * Remove timeout from tracking when it executes
   */
  removeTimeoutFromTracking(ruleId: string, leadSubid: string): void {
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

    this.logger.debug(
      `Removed timeout for rule ${ruleId}, lead ${leadSubid}. Remaining: ${updatedTimeouts.length}`,
    );
  }

  /**
   * Cancel all scheduled timeouts for a specific rule
   */
  cancelScheduledLeads(ruleId: string): CancelResult {
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
   * Get status of scheduled timeouts for a rule
   */
  getScheduledLeadsStatus(ruleId: string): ScheduledLeadsStatus {
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

  /**
   * Get total number of scheduled timeouts across all rules
   */
  getTotalScheduledCount(): number {
    let total = 0;
    for (const timeouts of this.scheduledTimeouts.values()) {
      total += timeouts.length;
    }
    return total;
  }

  /**
   * Get scheduled timeouts for all rules (for debugging)
   */
  getAllScheduledTimeouts(): Map<string, ScheduledTimeout[]> {
    return new Map(this.scheduledTimeouts);
  }
}
