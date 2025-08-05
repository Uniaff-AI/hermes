import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateRuleRequest, Rule, UpdateRule } from './schemas';
import { createQueryOptions } from '@/shared/api/hooks';
import { ANALYTICS_QUERY_KEYS } from '@/features/dashboard/model/hooks';
import { rulesToast } from './toast';

const RULES_QUERY_KEY = 'rules';
const API_BASE_URL = '/api';

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
    const response = await fetch(`${API_BASE_URL}/rules`);
    return handleApiResponse<Rule[]>(response);
  },

  async getRule(id: string): Promise<Rule> {
    const response = await fetch(`${API_BASE_URL}/rules/${id}`);
    return handleApiResponse<Rule>(response);
  },

  async createRule(data: CreateRuleRequest): Promise<Rule> {
    const response = await fetch(`${API_BASE_URL}/rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleApiResponse<Rule>(response);
  },

  async deleteRule(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/rules/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // DELETE returns 204 No Content, no JSON to parse
    return;
  },

  async updateRule(id: string, data: UpdateRule): Promise<Rule> {
    const response = await fetch(`${API_BASE_URL}/rules/${id}`, {
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
    mutationFn: (id: string) => rulesAPI.deleteRule(id),
    onMutate: async (deletedRuleId) => {
      await queryClient.cancelQueries({ queryKey: [RULES_QUERY_KEY] });
      await queryClient.cancelQueries({
        queryKey: ANALYTICS_QUERY_KEYS.overview,
      });

      const previousRules = queryClient.getQueryData<Rule[]>([RULES_QUERY_KEY]);
      const previousAnalytics = queryClient.getQueryData(
        ANALYTICS_QUERY_KEYS.overview
      );

      const deletedRule = previousRules?.find(
        (rule) => rule.id === deletedRuleId
      );

      queryClient.setQueryData<Rule[]>([RULES_QUERY_KEY], (old) => {
        return old ? old.filter((rule) => rule.id !== deletedRuleId) : [];
      });

      queryClient.setQueryData(ANALYTICS_QUERY_KEYS.overview, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          rules: old.rules.filter(
            (ruleAnalytics: any) => ruleAnalytics.rule.id !== deletedRuleId
          ),
          totalStats: {
            ...old.totalStats,
          },
        };
      });

      return { previousRules, previousAnalytics, deletedRule };
    },
    onError: (err, deletedRuleId, context) => {
      if (context?.previousRules) {
        queryClient.setQueryData([RULES_QUERY_KEY], context.previousRules);
      }
      if (context?.previousAnalytics) {
        queryClient.setQueryData(
          ANALYTICS_QUERY_KEYS.overview,
          context.previousAnalytics
        );
      }

      const errorMessage = err instanceof Error ? err.message : undefined;
      rulesToast.delete.error(errorMessage);
    },
    onSuccess: (_, deletedRuleId, context) => {
      if (context?.deletedRule) {
        rulesToast.delete.success(context.deletedRule.name);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [RULES_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: ANALYTICS_QUERY_KEYS.overview,
      });
    },
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
