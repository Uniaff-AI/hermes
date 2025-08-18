import { useQuery } from '@tanstack/react-query';
import { frontendClient } from '@/shared/model/client';
import {
  Product,
  ProductsResponseSchema,
  type ProductsFilters,
} from './schemas';

export const PRODUCTS_QUERY_KEYS = {
  PRODUCTS: ['products'] as const,
  PRODUCTS_FILTERED: ['products', 'filtered'] as const,
} as const;

const buildQueryParams = (filters?: ProductsFilters): string => {
  if (!filters || typeof filters !== 'object') {
    return '';
  }

  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  return params.toString();
};

export const useProducts = (filters?: ProductsFilters) => {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEYS.PRODUCTS_FILTERED, filters] as const,
    queryFn: async (): Promise<Product[]> => {
      if (typeof window === 'undefined') return [];

      try {
        const queryParams = buildQueryParams(filters);
        const url = queryParams
          ? `/api/external/get_products?${queryParams}`
          : '/api/external/get_products';

        const response = await frontendClient.get(url);

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

        // Generate uniqueProductKey for each product if it doesn't exist
        const productsWithKeys = data.map((product) => {
          if (!product.uniqueProductKey) {
            const productId = String(product.productId || '');
            const country = String(product.country || '').toUpperCase();
            const vertical = String(product.vertical || '');
            const aff = String(product.aff || '');

            // Generate unique composite key
            const uniqueProductKey = `${productId}-${vertical}-${country}-${aff}`;

            return {
              ...product,
              uniqueProductKey,
            };
          }
          return product;
        });

        return Array.isArray(productsWithKeys) ? productsWithKeys : [];
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
