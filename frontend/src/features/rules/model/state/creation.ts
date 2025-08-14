import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { BaseRuleState, BaseRuleActions } from './shared/types';
import { createInitialState } from './shared/initialState';
import { createCommonActions } from './shared/actions';
import { createNameHandlers } from './handlers/nameHandlers';
import { createLeadFilterHandlers } from './handlers/leadFilterHandlers';
import { createProductHandlers } from './handlers/productHandlers';
import { createSendingSettingsHandlers } from './handlers/sendingSettingsHandlers';
import { createInitializationService } from './services/initialization';
import { createLeadValidationService } from './services/leadValidation';
import { createRuleTestingService } from './services/ruleTesting';

interface RuleCreationState extends BaseRuleState {}

interface RuleCreationActions extends BaseRuleActions {
  getSubmitData: () => any;
}

export const useRuleCreationStore = create<
  RuleCreationState & RuleCreationActions
>()(
  devtools(
    (set, get) => ({
      // Initial state
      ...createInitialState(),

      // Common actions
      ...createCommonActions(set, get),

      // Event handlers
      ...createNameHandlers(set, get),
      ...createLeadFilterHandlers(set, get),
      ...createProductHandlers(set, get),
      ...createSendingSettingsHandlers(set, get),

      // Services
      ...createInitializationService(set, get),
      ...createLeadValidationService(set, get),
      ...createRuleTestingService(set, get),

      // Specific actions for creation
      getSubmitData: () => {
        const state = get();
        return {
          // Rule name
          name: state.name,

          // Section 2: Lead filters
          leadStatus: state.leadFilters.leadStatus || null,
          leadVertical: state.leadFilters.leadVertical || null,
          leadCountry: state.leadFilters.leadCountry || null,
          leadAffiliate: state.leadFilters.leadAffiliate || null,
          leadDateFrom: state.leadFilters.leadDateFrom || null,
          leadDateTo: state.leadFilters.leadDateTo || null,

          // Section 3: Target product
          targetProductId: state.targetProduct.targetProductId,
          targetProductName: state.targetProduct.targetProductName,
          targetProductVertical:
            state.targetProduct.targetProductVertical || null,
          targetProductCountry:
            state.targetProduct.targetProductCountry || null,
          targetProductAffiliate:
            state.targetProduct.targetProductAffiliate || null,

          // Sending settings
          dailyCapLimit: parseInt(state.sendingSettings.dailyCapLimit),
          minIntervalMinutes: parseInt(
            state.sendingSettings.minIntervalMinutes
          ),
          maxIntervalMinutes: parseInt(
            state.sendingSettings.maxIntervalMinutes
          ),
          isInfinite: state.sendingSettings.isInfinite,
          sendWindowStart: state.sendingSettings.isInfinite
            ? null
            : state.sendingSettings.sendWindowStart,
          sendWindowEnd: state.sendingSettings.isInfinite
            ? null
            : state.sendingSettings.sendWindowEnd,
          sendDateFrom: state.sendingSettings.sendDateFrom || null,
          sendDateTo: state.sendingSettings.sendDateTo || null,
          useEmail: state.sendingSettings.useEmail,
          usePhone: state.sendingSettings.usePhone,
          useRedirect: state.sendingSettings.useRedirect,
          isActive: state.sendingSettings.isActive,
        };
      },
    }),
    {
      name: 'rule-creation-store',
    }
  )
);
