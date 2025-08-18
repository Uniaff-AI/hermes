import { useQuery } from '@tanstack/react-query';
import { frontendClient } from '@/shared/model/client';
import { ApiResponseSchema } from '@/shared/api/apiSchema';
import { Lead, LeadSchema, type LeadsFilters } from './schemas';

export const LEADS_QUERY_KEYS = {
  LEADS: ['leads'] as const,
  LEADS_FILTERED: ['leads', 'filtered'] as const,
  LEADS_STATS: ['leads', 'stats'] as const,
} as const;

const LeadsResponseSchema = ApiResponseSchema(LeadSchema.array());

const buildQueryParams = (filters?: LeadsFilters): string => {
  if (!filters || typeof filters !== 'object') {
    return '';
  }

  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  return params.toString();
};

export const useLeads = (filters?: LeadsFilters) => {
  return useQuery({
    queryKey: [...LEADS_QUERY_KEYS.LEADS_FILTERED, filters] as const,
    queryFn: async (): Promise<Lead[]> => {
      if (typeof window === 'undefined') return [];

      try {
        const queryParams = buildQueryParams(filters);
        const url = queryParams
          ? `/api/external/get_leads?${queryParams}`
          : '/api/external/get_leads';

        const response = await frontendClient.get(url);

        let data: Lead[];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (
          response.data &&
          typeof response.data === 'object' &&
          'data' in response.data
        ) {
          if (
            response.data.data &&
            typeof response.data.data === 'object' &&
            'leads' in response.data.data &&
            Array.isArray(response.data.data.leads)
          ) {
            data = response.data.data.leads;
          } else {
            const parsed = LeadsResponseSchema.parse(response.data);
            data = parsed.data;
          }
        } else {
          return [];
        }

        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching leads:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: typeof window !== 'undefined',
    retry: 1,
    retryDelay: 1000,
  });
};

export const useLeadsStats = () => {
  return useQuery({
    queryKey: LEADS_QUERY_KEYS.LEADS_STATS,
    queryFn: async (): Promise<Lead[]> => {
      if (typeof window === 'undefined') return [];

      try {
        const response = await frontendClient.get('/api/external/get_leads');

        let data: Lead[];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (
          response.data &&
          typeof response.data === 'object' &&
          'data' in response.data
        ) {
          // Check if data is nested with leads property
          if (
            response.data.data &&
            typeof response.data.data === 'object' &&
            'leads' in response.data.data &&
            Array.isArray(response.data.data.leads)
          ) {
            data = response.data.data.leads;
          } else {
            const parsed = LeadsResponseSchema.parse(response.data);
            data = parsed.data;
          }
        } else {
          return [];
        }

        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching leads stats:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: typeof window !== 'undefined',
    retry: 1,
    retryDelay: 1000,
  });
};
