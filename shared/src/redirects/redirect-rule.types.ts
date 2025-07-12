export interface RedirectRule {
  id: string;
  name: string;
  conditions: RedirectCondition[];
  actions: RedirectAction[];
  priority: number;
  isActive: boolean;
}

export interface CreateRedirectRuleDto {
  name: string;
  conditions: RedirectCondition[];
  actions: RedirectAction[];
  priority: number;
}

export interface RedirectCondition {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'notIn' | 'greaterThan' | 'lessThan';
  value: string | number | string[] | number[];
}

export interface RedirectAction {
  type: 'redirect' | 'message' | 'both';
  targetUrl?: string;
  message?: string;
  offerId?: string;
}

export interface RedirectInput {
  url: string;
  params: Record<string, string>;
  headers: Record<string, string>;
  ip?: string;
  userAgent?: string;
  referrer?: string;
} 