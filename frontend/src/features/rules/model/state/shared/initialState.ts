import { StatusEnum } from '@/shared/utilities/enums';
import type { BaseRuleState } from './types';

export const initialLeadFilters = {
  leadStatus: '',
  leadVertical: '',
  leadCountry: '',
  leadAffiliate: '',
  leadDateFrom: '',
  leadDateTo: '',
};

export const initialTargetProduct = {
  targetProductId: '',
  targetProductName: '',
  targetProductVertical: '',
  targetProductCountry: '',
  targetProductAffiliate: '',
};

export const initialSendingSettings = {
  dailyCapLimit: '100',
  minIntervalMinutes: '5',
  maxIntervalMinutes: '15',
  isInfinite: false,
  sendWindowStart: '09:00',
  sendWindowEnd: '18:00',
  sendDateFrom: '',
  sendDateTo: '',
  isActive: true,
  useEmail: false,
  usePhone: false,
  useRedirect: true,
};

export const initialLeadValidation = {
  isChecking: false,
  result: 'idle' as const,
  message: '',
  leadCount: undefined,
  sampleLeads: undefined,
};

export const initialRuleTest = {
  isTesting: false,
  result: 'idle' as const,
  message: '',
  validationErrors: [],
};

export const initialLeadFilterOptions = {
  statuses: Object.values(StatusEnum).map((status) => ({
    label: status === 'ALL' ? 'Все статусы' : status,
    value: status,
  })),
  verticals: [],
  countries: [],
  affiliates: [],
};

export const createInitialState = (): BaseRuleState => ({
  name: '',
  leadFilters: initialLeadFilters,
  targetProduct: initialTargetProduct,
  sendingSettings: initialSendingSettings,
  validationErrors: [],
  products: [],
  filteredProducts: [],
  isProductsLoading: false,
  productOptions: [],
  leadValidation: initialLeadValidation,
  ruleTest: initialRuleTest,
  leadFilterOptions: initialLeadFilterOptions,
  startDate: null,
  endDate: null,
});
