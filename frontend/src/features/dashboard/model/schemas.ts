import { Rule } from '@/features/rules/model/schemas';

export interface AnalyticsLead {
  name: string;
  email: string;
  phone: string;
  successes: number;
  errors: number;
}

export interface RuleAnalytics extends Rule {
  channelType: 'Звонок' | 'Email' | 'SMS';
  sent: number;
  success: number;
  error: number;
  lastSent: string;
  leads: AnalyticsLead[];
  leadsExpanded?: boolean;
}

export interface Analytics {
  totalSent: number;
  sentDelta: string;
  totalSuccess: number;
  successRate: string;
  avgResponse: string;
}
