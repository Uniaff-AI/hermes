import { useMutation, useQuery } from '@tanstack/react-query';
import { frontendClient } from '@/shared/model/client';
import { ApiResponseSchema } from '@/shared/api/apiSchema';
import { Lead, LeadSchema, type LeadsFilters } from './schemas';

export const LEADS_QUERY_KEYS = {
  LEADS: ['leads'] as const,
} as const;

const LeadsResponseSchema = ApiResponseSchema(LeadSchema.array());

export const useLeads = (filters?: LeadsFilters) => {
  return useQuery({
    queryKey: [...LEADS_QUERY_KEYS.LEADS, filters] as const,
    queryFn: async (): Promise<Lead[]> => {
      // Prevent execution during SSR
      if (typeof window === 'undefined') {
        return [];
      }

      try {
        const cleanFilters =
          filters && typeof filters === 'object'
            ? Object.fromEntries(
                Object.entries(filters).filter(
                  ([_, value]) =>
                    value !== undefined && value !== null && value !== ''
                )
              )
            : {};

        const response = await frontendClient.post(
          '/api/get_leads',
          cleanFilters
        );
        const parsed = LeadsResponseSchema.parse(response.data);

        // Ensure we always return an array
        const data = parsed.data;
        if (!data || !Array.isArray(data)) {
          console.warn('Leads API returned non-array data:', data);
          return [];
        }

        return data;
      } catch (error) {
        console.error('Error fetching leads:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: typeof window !== 'undefined', // Only run on client side
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retry
  });
};

export const useLeadsMutation = () => {
  return useMutation({
    mutationFn: async (filters: LeadsFilters): Promise<Lead[]> => {
      try {
        const cleanFilters =
          filters && typeof filters === 'object'
            ? Object.fromEntries(
                Object.entries(filters).filter(
                  ([_, value]) =>
                    value !== undefined && value !== null && value !== ''
                )
              )
            : {};

        const response = await frontendClient.post(
          '/api/get_leads',
          cleanFilters
        );
        const parsed = LeadsResponseSchema.parse(response.data);

        // Ensure we always return an array
        const data = parsed.data;
        if (!data || !Array.isArray(data)) {
          console.warn('Leads mutation returned non-array data:', data);
          return [];
        }

        return data;
      } catch (error) {
        console.error('Error in leads mutation:', error);
        throw error;
      }
    },
  });
};
