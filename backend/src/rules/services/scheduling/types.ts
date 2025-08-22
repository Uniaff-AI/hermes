export interface ScheduledTimeout {
  timeoutId: NodeJS.Timeout;
  ruleId: string;
  leadSubid: string;
  scheduleTime: number;
  createdAt: number;
}

export interface ScheduledLeadsStatus {
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
}

export interface TriggerResult {
  ruleId: string;
  ruleName: string;
  triggered: boolean;
  timestamp: string;
  message: string;
}

export interface CancelResult {
  ruleId: string;
  cancelledCount: number;
  message: string;
}
