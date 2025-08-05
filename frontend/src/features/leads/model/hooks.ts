import { useQuery, useMutation } from '@tanstack/react-query';
import { client } from '@/shared/model/client';
import { ApiResponseSchema } from '@/shared/api/apiSchema';
import { LeadSchema, Lead, LeadsFilters } from './schemas';

export const LEADS_QUERY_KEYS = {
  LEADS: ['leads'] as const,
} as const;

const LeadsResponseSchema = ApiResponseSchema(LeadSchema.array());

export const useLeads = (filters?: LeadsFilters) => {
  return useQuery({
    queryKey: [...LEADS_QUERY_KEYS.LEADS, filters] as const,
    queryFn: async (): Promise<Lead[]> => {
      const cleanFilters = filters
        ? Object.fromEntries(
            Object.entries(filters).filter(
              ([_, value]) => value !== undefined && value !== ''
            )
          )
        : {};

      const response = await client.post('/get_leads/', cleanFilters);
      const parsed = LeadsResponseSchema.parse(response.data);
      return parsed.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enabled, empty filters = get all
  });
};

export const useLeadsMutation = () => {
  return useMutation({
    mutationFn: async (filters: LeadsFilters): Promise<Lead[]> => {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value !== undefined && value !== ''
        )
      );

      const response = await client.post('/get_leads/', cleanFilters);
      const parsed = LeadsResponseSchema.parse(response.data);
      return parsed.data;
    },
  });
};
