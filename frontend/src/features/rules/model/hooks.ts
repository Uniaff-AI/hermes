import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateRuleRequest, Rule, UpdateRule } from './schemas';
import { createQueryOptions } from '@/shared/api/hooks';
import { ANALYTICS_QUERY_KEYS } from '@/features/dashboard/model/hooks';
import { rulesToast } from './toast';
import { toast } from 'sonner';

const RULES_QUERY_KEY = 'rules';
const API_BASE_URL = '/api/internal/rules';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const result = await response.json();

  if (result && typeof result === 'object' && 'success' in result) {
    if (!result.success) {
      throw new Error(result.message || 'API request failed');
    }
    return result.data;
  } else {
    return result as T;
  }
}

const rulesAPI = {
  async getRules(): Promise<Rule[]> {
    const response = await fetch(`${API_BASE_URL}`);
    return handleApiResponse<Rule[]>(response);
  },

  async getRule(id: string): Promise<Rule> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    return handleApiResponse<Rule>(response);
  },

  async createRule(data: CreateRuleRequest): Promise<Rule> {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleApiResponse<Rule>(response);
  },

  async deleteRule(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // DELETE returns 204 No Content, no JSON to parse
    return;
  },

  async updateRule(id: string, data: UpdateRule): Promise<Rule> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleApiResponse<Rule>(response);
  },
};

// React Query hooks
export const useRules = () => {
  return useQuery({
    queryKey: [RULES_QUERY_KEY],
    queryFn: rulesAPI.getRules,
    ...createQueryOptions(),
  });
};

export const useRule = (id: string) => {
  return useQuery({
    queryKey: [RULES_QUERY_KEY, id],
    queryFn: () => rulesAPI.getRule(id),
    enabled: !!id,
    ...createQueryOptions(),
  });
};

export const useCreateRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRuleRequest) => rulesAPI.createRule(data),
    onSuccess: (createdRule) => {
      queryClient.invalidateQueries({ queryKey: [RULES_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: ANALYTICS_QUERY_KEYS.overview,
      });

      rulesToast.create.success(createdRule.name);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : undefined;
      rulesToast.create.error(errorMessage);
    },
  });
};

export const useDeleteRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/internal/rules/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: Failed to delete rule`
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Правило успешно удалено');
    },
    onError: (error) => {
      console.error('Delete rule error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Ошибка при удалении правила'
      );
    },
  });
};

// Тестирование и мониторинг
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
    enabled: false, // Запускаем только по требованию
    retry: false,
  });
};

export const useRuleDebugLogs = (ruleId: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['rule-debug-logs', ruleId],
    queryFn: async () => {
      const response = await fetch(`/api/internal/rules/debug/${ruleId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch debug logs`);
      }

      const result = await response.json();
      return result.data;
    },
    enabled: enabled && !!ruleId,
    refetchInterval: 30000, // Обновляем каждые 30 секунд
  });
};

export const useUpdateRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRule }) =>
      rulesAPI.updateRule(id, data),
    onSuccess: (updatedRule) => {
      queryClient.setQueryData<Rule[]>([RULES_QUERY_KEY], (old) => {
        return old
          ? old.map((rule) => (rule.id === updatedRule.id ? updatedRule : rule))
          : [];
      });

      queryClient.invalidateQueries({
        queryKey: ANALYTICS_QUERY_KEYS.overview,
      });

      rulesToast.update.success(updatedRule.name);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : undefined;
      rulesToast.update.error(errorMessage);
    },
  });
};
