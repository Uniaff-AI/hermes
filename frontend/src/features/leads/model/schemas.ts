import { z } from 'zod';

export const LeadSchema = z.object({
  date: z.string(),
  productName: z.string(),
  country: z.string(),
  vertical: z.string().nullable(),
  aff: z.string(),
  status: z.string().nullable(),
  subid: z.string(),
  leadName: z.string(),
  phone: z.string(),
  email: z.string().nullable(),
  ip: z.string(),
  ua: z.string(),
  productId: z.string(),
});

export const LeadsFiltersSchema = z.object({
  searchQuery: z.string().optional(),
  vertical: z.string().optional(),
  country: z.string().optional(),
  status: z.string().optional(),
  aff: z.string().optional(),
  productName: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const LeadsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(LeadSchema),
});

export type Lead = z.infer<typeof LeadSchema>;
export type LeadsFilters = z.infer<typeof LeadsFiltersSchema>;
export type LeadsResponse = z.infer<typeof LeadsResponseSchema>;
