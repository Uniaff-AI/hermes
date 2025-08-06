import { useQuery } from '@tanstack/react-query';
import { frontendClient } from '@/shared/model/client';
import { ApiResponseSchema } from '@/shared/api/apiSchema';
import { Product, ProductSchema } from './schemas';

export const OFFERS_QUERY_KEYS = {
  PRODUCTS: ['products'] as const,
} as const;

const ProductsResponseSchema = ApiResponseSchema(ProductSchema.array());

export const useProducts = () => {
  return useQuery({
    queryKey: OFFERS_QUERY_KEYS.PRODUCTS,
    queryFn: async (): Promise<Product[]> => {
      if (typeof window === 'undefined') return [];

      try {
        const response = await frontendClient.get('/api/get_products');

        let data: Product[];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (
          response.data &&
          typeof response.data === 'object' &&
          'data' in response.data
        ) {
          const parsed = ProductsResponseSchema.parse(response.data);
          data = parsed.data;
        } else {
          return [];
        }

        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching products:', error);
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
