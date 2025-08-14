import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateRuleRequest, UpdateRule, Rule } from '../schemas';
import { createQueryOptions } from '@/shared/api/hooks';
import { ANALYTICS_QUERY_KEYS } from '@/features/dashboard/model/hooks';
import { rulesToast } from '../toast';
import { toast } from 'sonner';
import { rulesAPI } from './api';

const RULES_QUERY_KEY = 'rules';

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
      rulesToast.delete.error(
        error instanceof Error ? error.message : undefined
      );
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

      queryClient.invalidateQueries({
        queryKey: ['rule-debug-logs', updatedRule.id],
      });

      queryClient.invalidateQueries({
        queryKey: [RULES_QUERY_KEY, updatedRule.id],
      });

      rulesToast.update.success(updatedRule.name);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : undefined;
      rulesToast.update.error(errorMessage);
    },
  });
};
