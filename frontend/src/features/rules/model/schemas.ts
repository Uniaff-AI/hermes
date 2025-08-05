import { z } from 'zod';

export const RuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  offerId: z.string().min(1),
  offerName: z.string().min(1),
  periodMinutes: z.number().min(1).max(1440),
  minInterval: z.number().min(0),
  maxInterval: z.number().min(0),
  dailyLimit: z.number().min(1).max(10000),
  sendWindowStart: z.string().regex(/^\d{2}:\d{2}$/),
  sendWindowEnd: z.string().regex(/^\d{2}:\d{2}$/),
  isActive: z.boolean(),
});

export const CreateRuleSchema = z.object({
  name: z.string().min(1),
  offerId: z.string().min(1),
  offerName: z.string().min(1),
  periodMinutes: z.number().min(1).max(1440),
  minInterval: z.number().min(0),
  maxInterval: z.number().min(0),
  dailyLimit: z.number().min(1).max(10000),
  sendWindowStart: z.string().regex(/^\d{2}:\d{2}$/),
  sendWindowEnd: z.string().regex(/^\d{2}:\d{2}$/),
  isActive: z.boolean().optional(),
});

export const UpdateRuleSchema = z.object({
  name: z.string().min(1).optional(),
  offerName: z.string().min(1).optional(),
  periodMinutes: z.number().min(1).max(1440).optional(),
  minInterval: z.number().min(0).optional(),
  maxInterval: z.number().min(0).optional(),
  dailyLimit: z.number().min(1).max(10000).optional(),
  sendWindowStart: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  sendWindowEnd: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  isActive: z.boolean().optional(),
});

export type Rule = z.infer<typeof RuleSchema>;
export type CreateRule = z.infer<typeof CreateRuleSchema>;
export type UpdateRule = z.infer<typeof UpdateRuleSchema>;

// API request types
export interface CreateRuleRequest {
  name: string;
  offerId: string;
  offerName: string;
  periodMinutes: number;
  minInterval: number;
  maxInterval: number;
  dailyLimit: number;
  sendWindowStart: string;
  sendWindowEnd: string;
  isActive?: boolean;
}
