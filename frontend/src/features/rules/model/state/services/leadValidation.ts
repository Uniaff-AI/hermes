import type { BaseRuleState } from '../shared/types';
import { initialLeadValidation } from '../shared/initialState';

export const createLeadValidationService = (
  set: any,
  get: () => BaseRuleState
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

      if (data.success && data.data && Array.isArray(data.data)) {
        const leadCount = data.data.length;

        if (leadCount > 0) {
          const sampleLeads = data.data.slice(0, 3).map((lead: any) => ({
            name: lead.leadName,
            phone: lead.phone,
            country: lead.country,
            status: lead.status,
            vertical: lead.vertical,
            affiliate: lead.aff,
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
      } else if (data.leads && Array.isArray(data.leads)) {
        const leadCount = data.leads.length;

        if (leadCount > 0) {
          const sampleLeads = data.leads.slice(0, 3).map((lead: any) => ({
            name: lead.leadName,
            phone: lead.phone,
            country: lead.country,
            status: lead.status,
            vertical: lead.vertical,
            affiliate: lead.aff,
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
      } else {
        throw new Error('Неверный формат ответа от API');
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
        state.leadFilters.leadStatus !== 'ALL'
      ) {
        params.append('status', state.leadFilters.leadStatus);
      }
      params.append('vertical', state.leadFilters.leadVertical);
      params.append('country', state.leadFilters.leadCountry);

      const response = await fetch(
        `/api/external/get_leads?${params.toString()}`
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      let leads: any[] = [];

      if (data.success && data.data && Array.isArray(data.data)) {
        leads = data.data;
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

      return Array.from(affiliates).sort();
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
});
