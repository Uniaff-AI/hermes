export interface LeadFilters {
  leadStatus: string;
  leadVertical: string;
  leadCountry: string;
  leadAffiliate: string;
  leadDateFrom: string;
  leadDateTo: string;
}

export interface TargetProduct {
  targetProductId: string;
  targetProductName: string;
  targetProductVertical: string;
  targetProductCountry: string;
  targetProductAffiliate: string;
}

export interface SendingSettings {
  dailyCapLimit: string;
  minIntervalMinutes: string;
  maxIntervalMinutes: string;
  isInfinite: boolean;
  sendWindowStart: string;
  sendWindowEnd: string;
  sendDateFrom: string;
  sendDateTo: string;
  isActive: boolean;
  useEmail: boolean;
  usePhone: boolean;
  useRedirect: boolean;
}

export interface LeadValidation {
  isChecking: boolean;
  result: 'idle' | 'success' | 'error' | 'no-leads';
  message: string;
  leadCount?: number;
  sampleLeads?: Array<{
    name: string;
    phone: string;
    country: string;
    status: string;
    vertical: string;
    affiliate: string;
  }>;
}

export interface RuleTest {
  isTesting: boolean;
  result: 'idle' | 'success' | 'error';
  message: string;
  validationErrors: string[];
}

export interface LeadFilterOptions {
  statuses: Array<{ label: string; value: string }>;
  verticals: Array<{ label: string; value: string }>;
  countries: Array<{ label: string; value: string }>;
  affiliates: Array<{ label: string; value: string }>;
}

export interface ProductOption {
  label: string;
  value: string;
  uniqueKey?: string;
  productId?: string;
  productName?: string;
  vertical?: string;
  country?: string;
  aff?: string;
}

export interface BaseRuleState {
  name: string;
  leadFilters: LeadFilters;
  targetProduct: TargetProduct;
  sendingSettings: SendingSettings;
  validationErrors: string[];
  products: any[];
  filteredProducts: any[];
  isProductsLoading: boolean;
  productOptions: ProductOption[];
  leadValidation: LeadValidation;
  ruleTest: RuleTest;
  leadFilterOptions: LeadFilterOptions;
  startDate: Date | null;
  endDate: Date | null;
}

export interface BaseRuleActions {
  resetForm: () => void;
  setValidationErrors: (errors: string[]) => void;
  validateForm: () => Promise<boolean>;

  // Section 1: Title
  handleNameChange: (value: string) => void;

  // Section 2: Lead filters
  handleLeadStatusChange: (value: string) => void;
  handleLeadVerticalChange: (value: string) => void;
  handleLeadCountryChange: (value: string) => void;
  handleLeadAffiliateChange: (value: string) => void;
  handleLeadDateFromChange: (date: Date | null) => void;
  handleLeadDateToChange: (date: Date | null) => void;
  clearLeadFilters: () => void;

  // Section 3: Target product
  handleTargetProductChange: (productId: string) => void;
  clearTargetProduct: () => void;
  applyProductFilter: () => Promise<void>;

  // Sending settings
  handleDailyCapLimitChange: (value: string) => void;
  handleMinIntervalMinutesChange: (value: string) => void;
  handleMaxIntervalMinutesChange: (value: string) => void;
  handleIsInfiniteChange: (value: boolean) => void;
  handleIsActiveChange: (value: boolean) => void;
  handleSendWindowStartChange: (value: string) => void;
  handleSendWindowEndChange: (value: string) => void;
  handleSendDateFromChange: (date: Date | null) => void;
  handleSendDateToChange: (date: Date | null) => void;
  handleUseEmailChange: (value: boolean) => void;
  handleUsePhoneChange: (value: boolean) => void;
  handleUseRedirectChange: (value: boolean) => void;

  // Initialization
  initializeProducts: (products: any[]) => void;

  // Lead validation
  checkLeadExistence: () => Promise<void>;
  resetLeadValidation: () => void;

  // Rule testing
  testRule: () => Promise<void>;
  resetRuleTest: () => void;
}
