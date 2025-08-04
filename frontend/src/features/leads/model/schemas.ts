import { z } from 'zod';
import {
  CountryEnum,
  VerticalEnum,
  AffEnum,
  StatusEnum,
} from '@/shared/types/enums';

// Lead schema (from get_leads endpoint)
export const LeadSchema = z.object({
  date: z.string(),
  productName: z.string(), // API returns productName, not jarName
  country: z.nativeEnum(CountryEnum),
  vertical: z.nativeEnum(VerticalEnum).nullable(), // Some records have null vertical
  aff: z.nativeEnum(AffEnum),
  status: z.nativeEnum(StatusEnum).nullable(), // Some records have null status
  subid: z.string(),
  leadName: z.string(), // API returns leadName, not name
  phone: z.string(),
  email: z.string().nullable(), // API can return null for email
  ip: z.string(),
  ua: z.string(),
  productId: z.string(), // API also returns productId
});

// Request schemas
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
