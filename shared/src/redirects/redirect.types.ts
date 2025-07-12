export interface Redirect {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  rules: RedirectRule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRedirectDto {
  name: string;
  description?: string;
  rules: CreateRedirectRuleDto[];
}

export interface UpdateRedirectDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  rules?: CreateRedirectRuleDto[];
}

export interface RedirectResult {
  targetUrl: string;
  message?: string;
  ruleId: string;
  redirectId: string;
} 