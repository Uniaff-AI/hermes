import type { BaseRuleState, BaseRuleActions } from '../shared/types';
import { formatDateToYYYYMMDD } from '../../../../../lib/utils';
import { initialLeadValidation } from '../shared/initialState';

export const createLeadFilterHandlers = (
  set: any,
  get: () => BaseRuleState & BaseRuleActions
) => ({
  handleLeadStatusChange: (value: string) => {
    set((state: BaseRuleState) => ({
      leadFilters: {
        ...state.leadFilters,
        leadStatus: value,
        leadAffiliate: '',
      },
      validationErrors: [],
      leadValidation: initialLeadValidation,
    }));

    if (get().leadFilters.leadVertical && get().leadFilters.leadCountry) {
      get().updateAvailableAffiliates();
    }
  },

  handleLeadVerticalChange: (value: string) => {
    set((state: BaseRuleState) => ({
      leadFilters: {
        ...state.leadFilters,
        leadVertical: value,
        leadAffiliate: '',
      },
      targetProduct: {
        ...state.targetProduct,
        targetProductVertical: value,
      },
      filteredProducts: [],
      productOptions: [],
      validationErrors: [],
      leadValidation: initialLeadValidation,
    }));

    if (value && get().leadFilters.leadCountry) {
      get().updateAvailableAffiliates();
    }
  },

  handleLeadCountryChange: (value: string) => {
    set((state: BaseRuleState) => ({
      leadFilters: {
        ...state.leadFilters,
        leadCountry: value,
        leadAffiliate: '',
      },
      targetProduct: {
        ...state.targetProduct,
        targetProductCountry: value,
      },
      filteredProducts: [],
      productOptions: [],
      validationErrors: [],
      leadValidation: initialLeadValidation,
    }));

    if (value && get().leadFilters.leadVertical) {
      get().updateAvailableAffiliates();
    }
  },

  handleLeadAffiliateChange: (value: string) => {
    set((state: BaseRuleState) => ({
      leadFilters: { ...state.leadFilters, leadAffiliate: value },
      validationErrors: [],
      leadValidation: initialLeadValidation,
    }));
  },

  handleLeadDateFromChange: (date: Date | null) => {
    set((state: BaseRuleState) => ({
      leadFilters: {
        ...state.leadFilters,
        leadDateFrom: date ? formatDateToYYYYMMDD(date) : '',
      },
      startDate: date,
      validationErrors: [],
      leadValidation: initialLeadValidation,
    }));
  },

  handleLeadDateToChange: (date: Date | null) => {
    set((state: BaseRuleState) => ({
      leadFilters: {
        ...state.leadFilters,
        leadDateTo: date ? formatDateToYYYYMMDD(date) : '',
      },
      endDate: date,
      validationErrors: [],
      leadValidation: initialLeadValidation,
    }));
  },

  clearLeadFilters: () => {
    set((state: BaseRuleState) => ({
      leadFilters: {
        leadStatus: '',
        leadVertical: '',
        leadCountry: '',
        leadAffiliate: '',
        leadDateFrom: '',
        leadDateTo: '',
      },
      targetProduct: {
        ...state.targetProduct,
        targetProductVertical: '',
        targetProductCountry: '',
      },
      filteredProducts: [],
      productOptions: [],
      startDate: null,
      endDate: null,
      validationErrors: [],
      leadValidation: initialLeadValidation,
    }));

    setTimeout(() => {
      get().updateAvailableAffiliates();
    }, 100);
  },
});
