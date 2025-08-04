import { z } from 'zod';
import { CountryEnum, VerticalEnum, AffEnum } from '@/shared/types/enums';

export const ProductSchema = z.object({
  productName: z.string(),
  country: z.nativeEnum(CountryEnum),
  vertical: z.nativeEnum(VerticalEnum),
  aff: z.nativeEnum(AffEnum),
  productId: z.string(),
});

export const OffersFiltersSchema = z.object({
  country: z.nativeEnum(CountryEnum).optional(),
  vertical: z.nativeEnum(VerticalEnum).optional(),
  aff: z.nativeEnum(AffEnum).optional(),
});

export type Product = z.infer<typeof ProductSchema>;
export type OffersFilters = z.infer<typeof OffersFiltersSchema>;
