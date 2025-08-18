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
    productName: string;
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
  revenue: ['revenue'] as const,
};

export interface RevenueData {
  countSales: number;
  salesDiff: number;
  revenue: number;
  revenueDiff: number;
}

export function useAnalyticsOverview() {
  return useQuery<AnalyticsOverview>({
    queryKey: ANALYTICS_QUERY_KEYS.overview,
    queryFn: async (): Promise<AnalyticsOverview> => {
      const response = await fetch('/api/internal/rules/analytics/overview');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const result = await response.json();
      return result.data || result;
    },
    refetchInterval: 15000,
    staleTime: 10000,
    gcTime: 30000,
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

export function useRevenue() {
  return useQuery<RevenueData>({
    queryKey: ANALYTICS_QUERY_KEYS.revenue,
    queryFn: async (): Promise<RevenueData> => {
      try {
        const response = await fetch('/api/external/get_revenue');
        if (!response.ok) {
          throw new Error(`Failed to fetch revenue data: ${response.status}`);
        }
        const result = await response.json();
        console.log('Revenue API response:', result);

        const data = result.data || result;
        console.log('Revenue data extracted:', data);

        if (!data || typeof data !== 'object') {
          console.warn('Invalid revenue data structure:', data);
          return {
            countSales: 0,
            salesDiff: 0,
            revenue: 0,
            revenueDiff: 0,
          };
        }

        return {
          countSales: data.countSales ?? 0,
          salesDiff: data.salesDiff ?? 0,
          revenue: data.revenue ?? 0,
          revenueDiff: data.revenueDiff ?? 0,
        };
      } catch (error) {
        console.error('Error in useRevenue:', error);
        return {
          countSales: 0,
          salesDiff: 0,
          revenue: 0,
          revenueDiff: 0,
        };
      }
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
