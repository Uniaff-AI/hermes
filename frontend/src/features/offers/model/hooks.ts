import { useQuery } from '@tanstack/react-query';
import { client } from '@/shared/model/client';
import { ApiResponseSchema } from '@/shared/api/apiSchema';
import { ProductSchema, Product } from './schemas';

export const OFFERS_QUERY_KEYS = {
  PRODUCTS: ['products'] as const,
} as const;

const ProductsResponseSchema = ApiResponseSchema(ProductSchema.array());

export const useProducts = () => {
  return useQuery({
    queryKey: OFFERS_QUERY_KEYS.PRODUCTS,
    queryFn: async (): Promise<Product[]> => {
      // Prevent execution during SSR
      if (typeof window === 'undefined') {
        return [];
      }

      try {
        const response = await client.get('/get_products/');
        const parsed = ProductsResponseSchema.parse(response.data);

        // Ensure we always return an array
        const data = parsed.data;
        if (!data || !Array.isArray(data)) {
          console.warn('Products API returned non-array data:', data);
          return [];
        }

        return data;
      } catch (error) {
        console.error('Error fetching products:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retry
    enabled: typeof window !== 'undefined', // Only run on client side
  });
};
