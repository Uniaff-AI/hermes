import { useQuery } from '@tanstack/react-query';
import { client } from '@/shared/model/client';
import { ApiResponseSchema } from '@/shared/api/schemas';
import { ProductSchema, Product } from './schemas';

export const OFFERS_QUERY_KEYS = {
  PRODUCTS: ['products'] as const,
} as const;

const ProductsResponseSchema = ApiResponseSchema(ProductSchema.array());

export const useProducts = () => {
  return useQuery({
    queryKey: OFFERS_QUERY_KEYS.PRODUCTS,
    queryFn: async (): Promise<Product[]> => {
      const response = await client.get('/get_products/');
      const parsed = ProductsResponseSchema.parse(response.data);
      return parsed.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
