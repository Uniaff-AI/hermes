import { z } from 'zod';
import { CountryEnum, VerticalEnum, AffEnum } from '@/shared/utilities/enums';

export const ProductSchema = z.object({
  productName: z.string(),
  country: z.nativeEnum(CountryEnum),
  vertical: z.nativeEnum(VerticalEnum),
  aff: z.nativeEnum(AffEnum),
  productId: z.string(),
  uniqueProductKey: z.string().optional(),
});

export const ProductsFiltersSchema = z.object({
  country: z.nativeEnum(CountryEnum).optional(),
  vertical: z.nativeEnum(VerticalEnum).optional(),
  aff: z.nativeEnum(AffEnum).optional(),
});

export const ProductsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ProductSchema),
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductsFilters = z.infer<typeof ProductsFiltersSchema>;
export type ProductsResponse = z.infer<typeof ProductsResponseSchema>;
