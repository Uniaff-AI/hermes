import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Rule, UpdateRule, CreateRuleRequest } from './schemas';
import { VerticalEnum } from '@/shared/utilities/enums';

interface RuleCreationState {
  name: string;
  selectedPartner: string;
  selectedCountry: string;
  selectedVertical: string;
  productId: string;
  productName: string;
  status: string;
  leadStatus: string;
  messageType: string;
  template: string;
  from: string;
  to: string;
  dailyCapLimitFilter: string;
  isInfinite: boolean;
  startTime: string;
  endTime: string;
  useEmail: boolean;
  usePhone: boolean;
  validationErrors: string[];
  products: any[];

  startDate: Date | null;
  endDate: Date | null;

  // Computed properties
  partnerPrograms: Array<{ label: string; value: string; uniqueKey?: string }>;
  availableCountries: Array<{
    label: string;
    value: string;
    uniqueKey?: string;
  }>;
  availableVerticals: Array<{ label: string; value: string }>;
  productOptions: Array<{ label: string; value: string; uniqueKey?: string }>;
}

interface RuleEditState {
  formData: UpdateRule;
  selectedPartner: string;
  selectedCountry: string;
  selectedProduct: string;
  selectedTemplate: string;
  validationErrors: string[];
  products: any[];

  partnerPrograms: Array<{ label: string; value: string; uniqueKey?: string }>;
  availableCountries: Array<{
    label: string;
    value: string;
    uniqueKey?: string;
  }>;
  availableVerticals: Array<{ label: string; value: string }>;
  productOptions: Array<{ label: string; value: string; uniqueKey?: string }>;
}

interface RuleCreationActions {
  setField: <K extends keyof RuleCreationState>(
    field: K,
    value: RuleCreationState[K]
  ) => void;
  resetForm: () => void;
  setValidationErrors: (errors: string[]) => void;

  handleNameChange: (value: string) => void;
  handlePartnerChange: (value: string) => void;
  handleCountryChange: (value: string) => void;
  handleVerticalChange: (value: string) => void;
  handleProductChange: (value: string) => void;
  handleProductNameChange: (value: string) => void;
  handleFromChange: (value: string) => void;
  handleToChange: (value: string) => void;
  handleDailyCapLimitFilterChange: (value: string) => void;
  handleStartTimeChange: (value: string) => void;
  handleEndTimeChange: (value: string) => void;
  handleIsInfiniteChange: (value: boolean) => void;
  handleUseEmailChange: (value: boolean) => void;
  handleUsePhoneChange: (value: boolean) => void;

  handleStartDateChange: (date: Date | null) => void;
  handleEndDateChange: (date: Date | null) => void;

  setStatus: (value: string) => void;
  setLeadStatus: (value: string) => void;
  setMessageType: (value: string) => void;
  setTemplate: (value: string) => void;

  initializeProducts: (products: any[]) => void;
  validateForm: () => boolean;
  getSubmitData: () => CreateRuleRequest;
}

interface RuleEditActions {
  setFormData: (data: Partial<UpdateRule>) => void;
  setSelectedPartner: (partner: string) => void;
  setSelectedCountry: (country: string) => void;
  setSelectedProduct: (product: string) => void;
  setSelectedTemplate: (template: string) => void;
  setValidationErrors: (errors: string[]) => void;
  resetForm: () => void;

  initializeFromRule: (rule: Rule, products: any[]) => void;
  validateForm: () => boolean;
  handleNameChange: (value: string) => void;
  handlePartnerChange: (value: string) => void;
  handleCountryChange: (value: string) => void;
  handleVerticalChange: (value: string) => void;
  handleStatusChange: (value: string) => void;
  handleActiveStatusChange: (value: string) => void;
  handleMinIntervalChange: (value: string) => void;
  handleMaxIntervalChange: (value: string) => void;
  handleDailyCapLimitChange: (value: string) => void;
  handleTimeChange: (
    field: 'sendWindowStart' | 'sendWindowEnd',
    value: string
  ) => void;
  handleInfiniteChange: (value: boolean) => void;
  handleProductChange: (value: string) => void;
  handleProductNameChange: (value: string) => void;

  partnerPrograms: Array<{ label: string; value: string; uniqueKey?: string }>;
  availableCountries: Array<{
    label: string;
    value: string;
    uniqueKey?: string;
  }>;
  availableVerticals: Array<{ label: string; value: string }>;
  productOptions: Array<{ label: string; value: string; uniqueKey?: string }>;
}

export const useRuleCreationStore = create<
  RuleCreationState & RuleCreationActions
>()(
  devtools(
    (set, get) => ({
      name: '',
      selectedPartner: '',
      selectedCountry: '',
      selectedVertical: '',
      productId: '',
      productName: '',
      status: 'active',
      leadStatus: '',
      messageType: '',
      template: '',
      from: '5',
      to: '15',
      dailyCapLimitFilter: '100',
      isInfinite: false,
      startTime: '09:00',
      endTime: '18:00',
      useEmail: false,
      usePhone: false,
      validationErrors: [],
      products: [],
      startDate: null,
      endDate: null,

      partnerPrograms: [],
      availableCountries: [],
      availableVerticals: Object.values(VerticalEnum).map((vertical) => ({
        label: vertical,
        value: vertical,
      })),
      productOptions: [],

      setField: (field, value) => {
        set({ [field]: value });
      },

      resetForm: () => {
        set({
          name: '',
          selectedPartner: '',
          selectedCountry: '',
          selectedVertical: '',
          productId: '',
          productName: '',
          status: 'active',
          leadStatus: '',
          messageType: '',
          template: '',
          from: '5',
          to: '15',
          dailyCapLimitFilter: '100',
          isInfinite: false,
          startTime: '09:00',
          endTime: '18:00',
          useEmail: false,
          usePhone: false,
          validationErrors: [],
          startDate: null,
          endDate: null,
        });
      },

      setValidationErrors: (errors) => {
        set({ validationErrors: errors });
      },

      // Form handlers
      handleNameChange: (value) => {
        set({ name: value, validationErrors: [] });
      },

      handlePartnerChange: (value) => {
        set({
          selectedPartner: value,
          selectedCountry: '',
          validationErrors: [],
        });
      },

      handleCountryChange: (value) => {
        set({ selectedCountry: value, validationErrors: [] });
      },

      handleVerticalChange: (value) => {
        set({ selectedVertical: value, validationErrors: [] });
      },

      handleProductChange: (value) => {
        const state = get();
        const selectedProduct = state.products.find(
          (p) => p.productId === value
        );
        set({
          productId: value,
          productName: selectedProduct?.productName || '',
          validationErrors: [],
        });
      },

      handleProductNameChange: (value) => {
        set({ productName: value, validationErrors: [] });
      },

      handleFromChange: (value) => {
        set({ from: value, validationErrors: [] });
      },

      handleToChange: (value) => {
        set({ to: value, validationErrors: [] });
      },

      handleDailyCapLimitFilterChange: (value) => {
        set({ dailyCapLimitFilter: value, validationErrors: [] });
      },

      handleStartTimeChange: (value) => {
        set({ startTime: value, validationErrors: [] });
      },

      handleEndTimeChange: (value) => {
        set({ endTime: value, validationErrors: [] });
      },

      handleIsInfiniteChange: (value) => {
        set({ isInfinite: value, validationErrors: [] });
      },

      handleUseEmailChange: (value) => {
        set({ useEmail: value, validationErrors: [] });
      },

      handleUsePhoneChange: (value) => {
        set({ usePhone: value, validationErrors: [] });
      },

      handleStartDateChange: (date) => {
        set({ startDate: date });
      },
      handleEndDateChange: (date) => {
        set({ endDate: date });
      },

      setStatus: (value) => {
        set({ status: value, validationErrors: [] });
      },

      setLeadStatus: (value) => {
        set({ leadStatus: value, validationErrors: [] });
      },

      setMessageType: (value) => {
        set({ messageType: value, validationErrors: [] });
      },

      setTemplate: (value) => {
        set({ template: value, validationErrors: [] });
      },

      initializeProducts: (products: any[]) => {
        const uniqueProducts = products.reduce((acc: any[], product: any) => {
          if (!acc.find((p: any) => p.productId === product.productId)) {
            acc.push({
              ...product,
              uniqueKey: `${product.productId}-${product.productName}-${product.aff}`,
            });
          }
          return acc;
        }, []);

        const productOptions = uniqueProducts.map((product: any) => ({
          label: product.productName,
          value: product.productId,
          uniqueKey: product.uniqueKey,
        }));

        const partnerPrograms = [
          ...new Set(uniqueProducts.map((p: any) => p.aff)),
        ].map((aff: string) => ({
          label: aff,
          value: aff,
          uniqueKey: `partner-${aff}`,
        }));

        const availableCountries = [
          ...new Set(uniqueProducts.map((p: any) => p.country)),
        ].map((country: string) => ({
          label: country,
          value: country,
          uniqueKey: `country-${country}`,
        }));

        set({
          products: uniqueProducts,
          productOptions,
          partnerPrograms,
          availableCountries,
        });
      },

      validateForm: () => {
        const state = get();
        const errors: string[] = [];

        if (!state.name.trim()) {
          errors.push('Название правила обязательно');
        }

        if (!state.productId) {
          errors.push('ID продукта обязателен');
        }

        if (
          !state.dailyCapLimitFilter ||
          parseInt(state.dailyCapLimitFilter) < 1
        ) {
          errors.push('Кап фильтр должен быть больше 0');
        }

        if (!state.useEmail && !state.usePhone) {
          errors.push('Необходимо выбрать хотя бы один метод отправки');
        }

        set({ validationErrors: errors });
        return errors.length === 0;
      },

      getSubmitData: () => {
        const state = get();
        return {
          name: state.name,
          productId: state.productId,
          productName: state.productName,
          periodMinutes: parseInt(state.to) - parseInt(state.from),
          minInterval: parseInt(state.from),
          maxInterval: parseInt(state.to),
          dailyCapLimit: parseInt(state.dailyCapLimitFilter),
          sendWindowStart: state.isInfinite ? undefined : state.startTime,
          sendWindowEnd: state.isInfinite ? undefined : state.endTime,
          isActive: state.status === 'active',
          isInfinite: state.isInfinite,
          vertical: state.selectedVertical || undefined,
          country: state.selectedCountry || undefined,
          status: state.leadStatus || undefined,
        };
      },
    }),
    {
      name: 'rule-creation-store',
    }
  )
);

export const useRuleEditStore = create<RuleEditState & RuleEditActions>()(
  devtools(
    (set, get) => ({
      formData: {},
      selectedPartner: '',
      selectedCountry: '',
      selectedProduct: '',
      selectedTemplate: '',
      validationErrors: [],
      products: [],

      partnerPrograms: [],
      availableCountries: [],
      availableVerticals: Object.values(VerticalEnum).map((vertical) => ({
        label: vertical,
        value: vertical,
      })),
      productOptions: [],

      setFormData: (data) => {
        set((state) => ({
          formData: { ...state.formData, ...data },
          validationErrors: [],
        }));
      },

      setSelectedPartner: (partner) => {
        set((state) => ({
          selectedPartner: partner,
          selectedCountry: '',
          formData: { ...state.formData, country: '' },
          validationErrors: [],
        }));
      },

      setSelectedCountry: (country) => {
        set((state) => ({
          selectedCountry: country,
          formData: { ...state.formData, country },
          validationErrors: [],
        }));
      },

      setSelectedProduct: (product) => {
        set({ selectedProduct: product, validationErrors: [] });
      },

      setSelectedTemplate: (template) => {
        set({ selectedTemplate: template });
      },

      setValidationErrors: (errors) => {
        set({ validationErrors: errors });
      },

      resetForm: () => {
        set({
          formData: {},
          selectedPartner: '',
          selectedCountry: '',
          selectedProduct: '',
          selectedTemplate: '',
          validationErrors: [],
        });
      },

      initializeFromRule: (rule, products) => {
        const uniqueProducts = products.reduce((acc: any[], product: any) => {
          if (!acc.find((p: any) => p.productId === product.productId)) {
            acc.push({
              ...product,
              uniqueKey: `${product.productId}-${product.productName}-${product.aff}`,
            });
          }
          return acc;
        }, []);

        const foundProduct = uniqueProducts.find(
          (p) => p.productId === rule.productId
        );
        const productOptions = uniqueProducts.map((product: any) => ({
          label: product.productName,
          value: product.productId,
          uniqueKey: product.uniqueKey,
        }));
        const partnerPrograms = [
          ...new Set(uniqueProducts.map((p: any) => p.aff)),
        ].map((aff: string) => ({
          label: aff,
          value: aff,
          uniqueKey: `partner-${aff}`,
        }));

        const availableCountries = [
          ...new Set(uniqueProducts.map((p: any) => p.country)),
        ].map((country: string) => ({
          label: country,
          value: country,
          uniqueKey: `country-${country}`,
        }));

        set({
          formData: {
            name: rule.name,
            periodMinutes: rule.periodMinutes,
            minInterval: rule.minInterval,
            maxInterval: rule.maxInterval,
            dailyCapLimit: rule.dailyCapLimit,
            sendWindowStart: rule.sendWindowStart,
            sendWindowEnd: rule.sendWindowEnd,
            isActive: rule.isActive,
            isInfinite: rule.isInfinite,
            vertical: rule.vertical,
            country: rule.country,
            status: rule.status,
            productName: rule.productName,
          },
          selectedPartner: foundProduct?.aff || '',
          selectedCountry: rule.country || '',
          selectedProduct: rule.productId,
          products: uniqueProducts,
          productOptions,
          partnerPrograms,
          availableCountries,
          validationErrors: [],
        });
      },

      validateForm: () => {
        const state = get();
        const errors: string[] = [];

        if (!state.formData.name?.trim()) {
          errors.push('Название правила обязательно');
        }

        if (
          state.formData.minInterval !== undefined &&
          state.formData.maxInterval !== undefined
        ) {
          if (state.formData.minInterval >= state.formData.maxInterval) {
            errors.push('Значение "От" должно быть меньше значения "До"');
          }
        }

        if (
          state.formData.dailyCapLimit !== undefined &&
          state.formData.dailyCapLimit < 1
        ) {
          errors.push('Кап фильтр должен быть числом >= 1');
        }

        set({ validationErrors: errors });
        return errors.length === 0;
      },

      handleNameChange: (value) => {
        set((state) => ({
          formData: { ...state.formData, name: value },
          validationErrors: [],
        }));
      },

      handlePartnerChange: (value) => {
        set((state) => ({
          selectedPartner: value,
          selectedCountry: '',
          formData: { ...state.formData, country: '' },
          validationErrors: [],
        }));
      },

      handleCountryChange: (value) => {
        set((state) => ({
          selectedCountry: value,
          formData: { ...state.formData, country: value },
          validationErrors: [],
        }));
      },

      handleVerticalChange: (value) => {
        set((state) => ({
          formData: { ...state.formData, vertical: value },
          validationErrors: [],
        }));
      },

      handleStatusChange: (value) => {
        set((state) => ({
          formData: { ...state.formData, status: value },
          validationErrors: [],
        }));
      },

      handleActiveStatusChange: (value) => {
        set((state) => ({
          formData: { ...state.formData, isActive: value === 'active' },
          validationErrors: [],
        }));
      },

      handleMinIntervalChange: (value) => {
        const numValue = parseInt(value);
        set((state) => ({
          formData: {
            ...state.formData,
            minInterval: isNaN(numValue) ? undefined : numValue,
          },
          validationErrors: [],
        }));
      },

      handleMaxIntervalChange: (value) => {
        const numValue = parseInt(value);
        set((state) => ({
          formData: {
            ...state.formData,
            maxInterval: isNaN(numValue) ? undefined : numValue,
          },
          validationErrors: [],
        }));
      },

      handleDailyCapLimitChange: (value) => {
        const numValue = parseInt(value);
        set((state) => ({
          formData: {
            ...state.formData,
            dailyCapLimit: isNaN(numValue) ? undefined : numValue,
          },
          validationErrors: [],
        }));
      },

      handleTimeChange: (field, value) => {
        set((state) => ({
          formData: { ...state.formData, [field]: value },
          validationErrors: [],
        }));
      },

      handleInfiniteChange: (value) => {
        set((state) => ({
          formData: { ...state.formData, isInfinite: value },
          validationErrors: [],
        }));
      },

      handleProductChange: (value) => {
        const state = get();
        const selectedProduct = state.products.find(
          (p) => p.productId === value
        );
        set((state) => ({
          selectedProduct: value,
          formData: {
            ...state.formData,
            productName: selectedProduct?.productName || '',
          },
          validationErrors: [],
        }));
      },

      handleProductNameChange: (value) => {
        set((state) => ({
          formData: { ...state.formData, productName: value },
          validationErrors: [],
        }));
      },
    }),
    {
      name: 'rule-edit-store',
    }
  )
);
