import { z } from 'zod';
import {
  CountryEnum,
  VerticalEnum,
  AffEnum,
  StatusEnum,
} from '@/shared/utilities/enums';

export const LeadSchema = z.object({
  date: z.string(),
  productName: z.string(),
  country: z.nativeEnum(CountryEnum),
  vertical: z.nativeEnum(VerticalEnum).nullable(),
  aff: z.nativeEnum(AffEnum),
  status: z.nativeEnum(StatusEnum).nullable(),
  subid: z.string(),
  leadName: z.string(),
  phone: z.string(),
  email: z.string().nullable(),
  ip: z.string(),
  ua: z.string(),
  productId: z.string(),
});

export const LeadsFiltersSchema = z.object({
  vertical: z.nativeEnum(VerticalEnum).optional(),
  country: z.nativeEnum(CountryEnum).optional(),
  status: z.nativeEnum(StatusEnum).optional(),
  productName: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type Lead = z.infer<typeof LeadSchema>;
export type LeadsFilters = z.infer<typeof LeadsFiltersSchema>;
