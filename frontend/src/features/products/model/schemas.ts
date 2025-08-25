import { z } from 'zod';

export const ProductSchema = z.object({
  productName: z.string(),
  country: z.string(),
  vertical: z.string(),
  aff: z.string(),
  productId: z.string(),
  uniqueProductKey: z.string().optional(),
});

export const ProductsFiltersSchema = z.object({
  country: z.string().optional(),
  vertical: z.string().optional(),
  aff: z.string().optional(),
});

export const ProductsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ProductSchema),
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductsFilters = z.infer<typeof ProductsFiltersSchema>;
export type ProductsResponse = z.infer<typeof ProductsResponseSchema>;
