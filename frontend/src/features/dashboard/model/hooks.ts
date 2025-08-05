import { useQuery } from '@tanstack/react-query';
import { client } from '@/shared/model/client';

export interface LeadSendingResult {
  id: string;
  subid: string;
  leadName: string;
  phone: string;
  email?: string;
  status: 'success' | 'error';
  errorDetails?: string;
  sentAt: string;
}

export interface RuleAnalytics {
  rule: {
    id: string;
    name: string;
    offerName: string;
    isActive: boolean;
  };
  stats: {
    totalSent: number;
    totalSuccess: number;
    totalErrors: number;
    successRate: string;
    lastSent: string;
  };
  recentSendings: LeadSendingResult[];
}

export interface AnalyticsOverview {
  totalStats: {
    totalSent: number;
    totalSuccess: number;
    totalErrors: number;
    successRate: string;
  };
  rules: RuleAnalytics[];
}

export const ANALYTICS_QUERY_KEYS = {
  overview: ['analytics', 'overview'] as const,
  rule: (ruleId: string) => ['analytics', 'rule', ruleId] as const,
};

export function useAnalyticsOverview() {
  return useQuery<AnalyticsOverview>({
    queryKey: ANALYTICS_QUERY_KEYS.overview,
    queryFn: async (): Promise<AnalyticsOverview> => {
      const response = await client.get<AnalyticsOverview>(
        '/rules/analytics/overview'
      );
      return response.data;
    },
    refetchInterval: 30000, // Обновляем каждые 30 секунд
  });
}

export function useRuleAnalytics(ruleId: string) {
  return useQuery<RuleAnalytics>({
    queryKey: ANALYTICS_QUERY_KEYS.rule(ruleId),
    queryFn: async (): Promise<RuleAnalytics> => {
      const response = await client.get<RuleAnalytics>(
        `/rules/${ruleId}/analytics`
      );
      return response.data;
    },
    refetchInterval: 30000,
    enabled: !!ruleId,
  });
}
