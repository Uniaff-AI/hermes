import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RuleDebugLogs } from '../schemas';
import { toast } from 'sonner';

// Testing and monitoring
export const useTestRule = () => {
  return useMutation({
    mutationFn: async (ruleId: string) => {
      const response = await fetch(
        `/api/internal/rules/${ruleId}?action=test`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: Failed to test rule`
        );
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Тест правила завершен');
    },
    onError: (error) => {
      console.error('Test rule error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Ошибка при тестировании правила'
      );
    },
  });
};

export const useTriggerRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ruleId: string) => {
      const response = await fetch(
        `/api/internal/rules/${ruleId}?action=trigger`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: Failed to trigger rule`
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Правило запущено вручную');
    },
    onError: (error) => {
      console.error('Trigger rule error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Ошибка при запуске правила'
      );
    },
  });
};

export const useTestConnection = () => {
  return useQuery({
    queryKey: ['test-connection'],
    queryFn: async () => {
      const response = await fetch(
        '/api/internal/rules/external/test-connection'
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to test connection`);
      }

      const result = await response.json();
      return result.data;
    },
    enabled: false,
    retry: false,
  });
};

export const useRuleDebugLogs = (ruleId: string, enabled: boolean = false) => {
  return useQuery<RuleDebugLogs>({
    queryKey: ['rule-debug-logs', ruleId],
    queryFn: async () => {
      const response = await fetch(`/api/internal/rules/debug/logs/${ruleId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `HTTP ${response.status}: Failed to fetch rule debug logs`
        );
      }

      const result = await response.json();

      if (!result.success && result.message) {
        throw new Error(result.message);
      }

      return result.data || result;
    },
    enabled: enabled && !!ruleId,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5000,
    gcTime: 5 * 60 * 1000,
  });
};

// Test hook for simulating various monitoring scenarios
export const useTestMonitoringScenarios = (
  ruleId: string,
  scenario: 'normal' | 'error' | 'no-data' | 'loading' = 'normal'
) => {
  return useQuery<RuleDebugLogs>({
    queryKey: ['test-monitoring', ruleId, scenario],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      switch (scenario) {
        case 'error':
          throw new Error('Симулированная ошибка для тестирования');
        case 'no-data':
          return {
            ruleId,
            ruleName: 'Тестовое правило',
            ruleConfig: {
              isActive: true,
              isInfinite: false,
              productName: 'Test Product',
              country: 'Test',
              vertical: 'Test',
              status: 'Test',
              dailyCapLimit: 10,
              sendWindow: '09:00-18:00',
              intervals: '1-3min',
            },
            recentActivity: [],
            stats: { totalAttempts: 0, successful: 0, failed: 0 },
            timestamp: new Date().toISOString(),
          };
        case 'loading':
          throw new Error('Loading...');
        default:
          const response = await fetch(
            `/api/internal/rules/debug/logs/${ruleId}`
          );
          if (!response.ok) {
            throw new Error(
              `HTTP ${response.status}: Failed to fetch rule debug logs`
            );
          }
          const result = await response.json();
          return result.data || result;
      }
    },
    enabled: !!ruleId,
    retry: false,
  });
};
