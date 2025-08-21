import { z } from 'zod';

export const RuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  isActive: z.boolean(),
  dailyCapLimit: z.number().min(1).max(500),

  // Section 2: Lead filters
  leadStatus: z.string().optional(),
  leadVertical: z.string().optional(),
  leadCountry: z.string().optional(),
  leadAffiliate: z.string().optional(),
  leadDateFrom: z.string().optional(),
  leadDateTo: z.string().optional(),

  // Section 3: Target product
  targetProductId: z.string().min(1),
  targetProductName: z.string().min(1),
  targetProductVertical: z.string().optional(),
  targetProductCountry: z.string().optional(),
  targetProductAffiliate: z.string().optional(),

  // Sending settings
  minIntervalMinutes: z.number().min(1),
  maxIntervalMinutes: z.number().min(1),
  isInfinite: z.boolean(),
  sendWindowStart: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  sendWindowEnd: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  sendDateFrom: z.string().optional(),
  sendDateTo: z.string().optional(),
  useEmail: z.boolean().optional(),
  usePhone: z.boolean().optional(),
  useRedirect: z.boolean().optional(),

  // Metadata
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateRuleSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),

    // Section 2: Lead filters
    leadStatus: z.string().optional(),
    leadVertical: z.string().optional(),
    leadCountry: z.string().optional(),
    leadAffiliate: z.string().optional(),
    leadDateFrom: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format')
      .nullable()
      .optional(),
    leadDateTo: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format')
      .nullable()
      .optional(),

    // Section 3: Target product
    targetProductId: z.string().min(1, 'Target product ID is required'),
    targetProductName: z.string().min(1, 'Target product name is required'),
    targetProductVertical: z.string().optional(),
    targetProductCountry: z.string().optional(),
    targetProductAffiliate: z.string().optional(),

    // Sending settings
    dailyCapLimit: z.number().min(1, 'Daily cap limit must be at least 1'),
    minIntervalMinutes: z.number().min(1, 'Min interval must be at least 1'),
    maxIntervalMinutes: z.number().min(1, 'Max interval must be at least 1'),
    sendWindowStart: z
      .string()
      .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Must be in HH:MM or HH:MM:SS format')
      .nullable()
      .optional(),
    sendWindowEnd: z
      .string()
      .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Must be in HH:MM or HH:MM:SS format')
      .nullable()
      .optional(),
    sendDateFrom: z.string().nullable().optional(),
    sendDateTo: z.string().nullable().optional(),
    useEmail: z.boolean().optional(),
    usePhone: z.boolean().optional(),
    useRedirect: z.boolean().optional(),
    isActive: z.boolean().optional(),
    isInfinite: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // When isInfinite is false, time windows are required
      if (data.isInfinite !== true) {
        return (
          data.sendWindowStart !== undefined &&
          data.sendWindowStart !== null &&
          data.sendWindowEnd !== undefined &&
          data.sendWindowEnd !== null
        );
      }
      return true;
    },
    {
      message:
        'sendWindowStart and sendWindowEnd are required when isInfinite is false',
    }
  )
  .refine(
    (data) => {
      // Validate geographic consistency (countries must match)
      const hasLeadCountry = data.leadCountry && data.leadCountry.trim() !== '';
      const hasTargetCountry =
        data.targetProductCountry && data.targetProductCountry.trim() !== '';

      // If both countries are specified, they should match
      if (
        hasLeadCountry &&
        hasTargetCountry &&
        data.leadCountry !== data.targetProductCountry
      ) {
        return false;
      }

      // Affiliate validation is disabled - cross-affiliate redirection is allowed
      return true;
    },
    {
      message:
        'Lead filters and target product must have matching country parameters. Cannot redirect leads between different countries.',
    }
  );

export const UpdateRuleSchema = z
  .object({
    name: z.string().min(1).optional(),

    // Section 2: Lead filters
    leadStatus: z.string().nullable().optional(),
    leadVertical: z.string().nullable().optional(),
    leadCountry: z.string().nullable().optional(),
    leadAffiliate: z.string().nullable().optional(),
    leadDateFrom: z.string().nullable().optional(),
    leadDateTo: z.string().nullable().optional(),

    // Section 3: Target product
    targetProductId: z.string().optional(),
    targetProductName: z.string().min(1).optional(),
    targetProductVertical: z.string().nullable().optional(),
    targetProductCountry: z.string().nullable().optional(),
    targetProductAffiliate: z.string().nullable().optional(),

    // Sending settings
    dailyCapLimit: z.number().min(1).max(500).optional(),
    minIntervalMinutes: z.number().min(1).optional(),
    maxIntervalMinutes: z.number().min(1).optional(),
    sendWindowStart: z
      .string()
      .regex(/^\d{2}:\d{2}(:\d{2})?$/)
      .optional(),
    sendWindowEnd: z
      .string()
      .regex(/^\d{2}:\d{2}(:\d{2})?$/)
      .optional(),
    sendDateFrom: z.string().optional(),
    sendDateTo: z.string().optional(),
    useEmail: z.boolean().optional(),
    usePhone: z.boolean().optional(),
    useRedirect: z.boolean().optional(),
    isActive: z.boolean().optional(),
    isInfinite: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // Validate geographic consistency (countries must match)
      const hasLeadCountry = data.leadCountry && data.leadCountry.trim() !== '';
      const hasTargetCountry =
        data.targetProductCountry && data.targetProductCountry.trim() !== '';

      // If both countries are specified, they should match
      if (
        hasLeadCountry &&
        hasTargetCountry &&
        data.leadCountry !== data.targetProductCountry
      ) {
        return false;
      }

      // Affiliate validation is disabled - cross-affiliate redirection is allowed
      return true;
    },
    {
      message:
        'Lead filters and target product must have matching country parameters. Cannot redirect leads between different countries.',
    }
  );

export type Rule = z.infer<typeof RuleSchema>;
export type CreateRule = z.infer<typeof CreateRuleSchema>;
export type UpdateRule = z.infer<typeof UpdateRuleSchema>;

// API request types
export interface CreateRuleRequest {
  name: string;

  // Section 2: Lead filters
  leadStatus?: string;
  leadVertical?: string;
  leadCountry?: string;
  leadAffiliate?: string;
  leadDateFrom?: string;
  leadDateTo?: string;

  // Section 3: Target product
  targetProductId: string;
  targetProductName: string;
  targetProductVertical?: string;
  targetProductCountry?: string;
  targetProductAffiliate?: string;

  // Sending settings
  dailyCapLimit: number;
  minIntervalMinutes: number;
  maxIntervalMinutes: number;
  sendWindowStart?: string;
  sendWindowEnd?: string;
  sendDateFrom?: string;
  sendDateTo?: string;
  useEmail?: boolean;
  usePhone?: boolean;
  useRedirect?: boolean;
  isActive?: boolean;
  isInfinite?: boolean;
}

// Types for rule debug logs
export interface RuleDebugLogs {
  ruleId: string;
  ruleName: string;
  ruleConfig: {
    isActive: boolean;
    isInfinite: boolean;
    productName?: string;
    productId?: string;
    country?: string;
    vertical?: string;
    status?: string;
    dailyCapLimit?: number;
    sendWindow?: string;
    sendDateWindow?: string;
    intervals?: string;
    dateFrom?: string;
    dateTo?: string;
    // Keep old fields for backward compatibility
    targetProductName?: string;
    targetProductId?: string;
    targetProductCountry?: string;
    targetProductVertical?: string;
    leadStatus?: string;
    leadDateFrom?: string;
    leadDateTo?: string;
  };
  recentActivity: Array<{
    id: string;
    leadSubid: string;
    leadName: string;
    leadPhone: string;
    leadEmail?: string;
    leadCountry?: string;
    status: 'SUCCESS' | 'ERROR';
    responseStatus?: number;
    errorDetails?: string;
    sentAt: string;
  }>;
  stats: {
    totalAttempts: number;
    successful: number;
    failed: number;
  };
  diagnostics?: {
    validationIssues: string[];
    leadAnalysis: {
      available: number;
      filters?: any;
      sampleLeads?: Array<{
        name: string;
        phone: string;
        country: string;
        status: string;
      }>;
      error?: string;
    };
    lastCheck: string;
    ruleHealth: 'healthy' | 'issues';
    recommendations: string[];
  };
  timestamp: string;
}
