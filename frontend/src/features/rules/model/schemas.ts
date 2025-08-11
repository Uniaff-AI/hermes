import { z } from 'zod';

export const RuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  productId: z.string().min(1),
  productName: z.string().min(1),
  periodMinutes: z.number().min(1).max(1440),
  minInterval: z.number().min(0),
  maxInterval: z.number().min(0),
  dailyCapLimit: z.number().min(1).max(10000),
  sendWindowStart: z.string().regex(/^\d{2}:\d{2}$/),
  sendWindowEnd: z.string().regex(/^\d{2}:\d{2}$/),
  isActive: z.boolean(),
  isInfinite: z.boolean().optional(),
  vertical: z.string().optional(),
  country: z.string().optional(),
  status: z.string().optional(),
});

export const CreateRuleSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    productId: z.string().min(1, 'Product ID is required'),
    productName: z.string().min(1, 'Product name is required'),
    periodMinutes: z.number().min(1, 'Period minutes must be at least 1'),
    minInterval: z.number().min(1, 'Min interval must be at least 1'),
    maxInterval: z.number().min(1, 'Max interval must be at least 1'),
    dailyCapLimit: z.number().min(1, 'Daily cap limit must be at least 1'),
    sendWindowStart: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Must be in HH:MM format')
      .optional(),
    sendWindowEnd: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Must be in HH:MM format')
      .optional(),
    vertical: z.string().optional(),
    country: z.string().optional(),
    status: z.string().optional(),
    dateFrom: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format')
      .optional(),
    dateTo: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format')
      .optional(),
    isActive: z.boolean().optional(),
    isInfinite: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // When isInfinite is false, time windows are required
      if (data.isInfinite !== true) {
        return (
          data.sendWindowStart !== undefined && data.sendWindowEnd !== undefined
        );
      }
      return true;
    },
    {
      message:
        'sendWindowStart and sendWindowEnd are required when isInfinite is false',
    }
  );

export const UpdateRuleSchema = z.object({
  name: z.string().min(1).optional(),
  productName: z.string().min(1).optional(),
  periodMinutes: z.number().min(1).max(1440).optional(),
  minInterval: z.number().min(0).optional(),
  maxInterval: z.number().min(0).optional(),
  dailyCapLimit: z.number().min(1).max(10000).optional(),
  sendWindowStart: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  sendWindowEnd: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  isActive: z.boolean().optional(),
  isInfinite: z.boolean().optional(),
  vertical: z.string().optional(),
  country: z.string().optional(),
  status: z.string().optional(),
});

export type Rule = z.infer<typeof RuleSchema>;
export type CreateRule = z.infer<typeof CreateRuleSchema>;
export type UpdateRule = z.infer<typeof UpdateRuleSchema>;

// API request types
export interface CreateRuleRequest {
  name: string;
  productId: string;
  productName: string;
  periodMinutes: number;
  minInterval: number;
  maxInterval: number;
  dailyCapLimit?: number;
  sendWindowStart?: string;
  sendWindowEnd?: string;
  isActive?: boolean;
  isInfinite?: boolean;
  vertical?: string;
  country?: string;
  status?: string;
}
