import type { BaseRuleState } from '../shared/types';
import { initialLeadValidation } from '../shared/initialState';

export const createLeadValidationService = (
  set: any,
  get: () => BaseRuleState & {
    checkAvailableAffiliates: () => Promise<string[]>;
    updateAvailableAffiliates: () => Promise<void>;
  }
) => ({
  checkLeadExistence: async () => {
    const state = get();

    const hasFilters =
      state.leadFilters.leadStatus ||
      state.leadFilters.leadVertical ||
      state.leadFilters.leadCountry ||
      state.leadFilters.leadAffiliate ||
      state.leadFilters.leadDateFrom ||
      state.leadFilters.leadDateTo;

    if (!hasFilters) {
      set({
        leadValidation: {
          isChecking: false,
          result: 'error',
          message: 'Укажите хотя бы один фильтр для проверки лидов',
          leadCount: undefined,
        },
      });
      return;
    }

    set({
      leadValidation: {
        isChecking: true,
        result: 'idle',
        message: 'Проверяем наличие лидов...',
        leadCount: undefined,
      },
    });

    try {
      const params = new URLSearchParams();
      if (state.leadFilters.leadStatus)
        params.append('status', state.leadFilters.leadStatus);
      if (state.leadFilters.leadVertical)
        params.append('vertical', state.leadFilters.leadVertical);
      if (state.leadFilters.leadCountry)
        params.append('country', state.leadFilters.leadCountry);
      if (state.leadFilters.leadAffiliate)
        params.append('aff', state.leadFilters.leadAffiliate);
      if (state.leadFilters.leadDateFrom)
        params.append('dateFrom', state.leadFilters.leadDateFrom);
      if (state.leadFilters.leadDateTo)
        params.append('dateTo', state.leadFilters.leadDateTo);

      const response = await fetch(
        `/api/external/get_leads?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('checkLeadExistence - API response:', data);

      let leads: any[] = [];

      if (data.success && data.data && Array.isArray(data.data)) {
        leads = data.data;
      } else if (
        data.success &&
        data.data &&
        data.data.leads &&
        Array.isArray(data.data.leads)
      ) {
        leads = data.data.leads;
      } else if (data.leads && Array.isArray(data.leads)) {
        leads = data.leads;
      } else if (Array.isArray(data)) {
        leads = data;
      } else {
        console.error(
          'checkLeadExistence - Unexpected API response format:',
          data
        );
        throw new Error('Неверный формат ответа от API');
      }

      const leadCount = leads.length;
      console.log('checkLeadExistence - Found leads count:', leadCount);

      if (leadCount > 0) {
        const sampleLeads = leads.slice(0, 3).map((lead: any) => ({
          name: lead.leadName || lead.name || 'N/A',
          phone: lead.phone || 'N/A',
          country: lead.country || 'N/A',
          status: lead.status || 'N/A',
          vertical: lead.vertical || 'N/A',
          affiliate: lead.aff || lead.affiliate || 'N/A',
        }));

        set({
          leadValidation: {
            isChecking: false,
            result: 'success',
            message: `Найдено ${leadCount} лидов, соответствующих фильтрам`,
            leadCount,
            sampleLeads,
          },
        });
      } else {
        set({
          leadValidation: {
            isChecking: false,
            result: 'no-leads',
            message: 'Лиды с указанными фильтрами не найдены',
            leadCount: 0,
          },
        });
      }
    } catch (error) {
      console.error('Ошибка при проверке лидов:', error);
      set({
        leadValidation: {
          isChecking: false,
          result: 'error',
          message: `Ошибка при проверке: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
          leadCount: undefined,
        },
      });
    }
  },

  checkAvailableAffiliates: async () => {
    const state = get();

    if (!state.leadFilters.leadVertical || !state.leadFilters.leadCountry) {
      return [];
    }

    try {
      const params = new URLSearchParams();
      params.append('limit', '100');

      if (
        state.leadFilters.leadStatus &&
        state.leadFilters.leadStatus !== 'ALL' &&
        state.leadFilters.leadStatus !== ''
      ) {
        params.append('status', state.leadFilters.leadStatus);
      }
      params.append('vertical', state.leadFilters.leadVertical);
      params.append('country', state.leadFilters.leadCountry);

      const response = await fetch(
        `/api/external/get_leads?${params.toString()}`
      );

      if (!response.ok) {
        console.error(
          'API response not ok:',
          response.status,
          response.statusText
        );
        return [];
      }

      const data = await response.json();
      let leads: any[] = [];

      if (data.success && data.data && Array.isArray(data.data)) {
        leads = data.data;
      } else if (
        data.success &&
        data.data &&
        data.data.leads &&
        Array.isArray(data.data.leads)
      ) {
        leads = data.data.leads;
      } else if (data.leads && Array.isArray(data.leads)) {
        leads = data.leads;
      } else if (Array.isArray(data)) {
        leads = data;
      }

      const affiliates = new Set<string>();
      leads.forEach((lead: any) => {
        const aff = lead.aff || lead.affiliate;
        if (aff && typeof aff === 'string' && aff.trim()) {
          affiliates.add(aff.trim());
        }
      });

      const result = Array.from(affiliates).sort();
      console.log('Available affiliates found:', result.length, result);
      return result;
    } catch (error) {
      console.error('Ошибка при получении доступных affiliate:', error);
      return [];
    }
  },

  resetLeadValidation: () => {
    set({
      leadValidation: initialLeadValidation,
    });
  },

  updateAvailableAffiliates: async () => {
    const state = get();

    set({
      leadFilterOptions: {
        ...state.leadFilterOptions,
        affiliates: [
          {
            label: 'Загрузка доступных affiliate...',
            value: '',
          },
        ],
      },
    });

    if (!state.leadFilters.leadVertical || !state.leadFilters.leadCountry) {
      const allAffiliates = [...new Set(state.products.map((p: any) => p.aff))];
      set({
        leadFilterOptions: {
          ...state.leadFilterOptions,
          affiliates: allAffiliates.map((aff: any) => ({
            label: aff,
            value: aff,
          })),
        },
      });
      console.log(
        'updateAvailableAffiliates - No vertical/country, showing all affiliates:',
        allAffiliates
      );
      return;
    }

    try {
      const availableAffiliates = await get().checkAvailableAffiliates();

      if (availableAffiliates.length === 0) {
        set({
          leadFilterOptions: {
            ...state.leadFilterOptions,
            affiliates: [
              {
                label: 'Нет доступных affiliate для выбранных параметров',
                value: '',
              },
            ],
          },
        });
        console.log(
          'updateAvailableAffiliates - No affiliates found for:',
          state.leadFilters.leadVertical,
          state.leadFilters.leadCountry
        );
      } else {
        set({
          leadFilterOptions: {
            ...state.leadFilterOptions,
            affiliates: availableAffiliates.map((aff: string) => ({
              label: aff,
              value: aff,
            })),
          },
        });
        console.log(
          'updateAvailableAffiliates - Found affiliates:',
          availableAffiliates
        );
      }
    } catch (error) {
      console.error('Ошибка при обновлении доступных affiliate:', error);
      set({
        leadFilterOptions: {
          ...state.leadFilterOptions,
          affiliates: [
            {
              label: 'Ошибка загрузки affiliate',
              value: '',
            },
          ],
        },
      });
    }
  },

  refreshAvailableAffiliates: async () => {
    const state = get();

    set((state: BaseRuleState) => ({
      leadFilters: {
        ...state.leadFilters,
        leadAffiliate: '',
      },
    }));

    await get().updateAvailableAffiliates();
  },
});
