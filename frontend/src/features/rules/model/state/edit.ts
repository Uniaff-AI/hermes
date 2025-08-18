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
import type { Rule, UpdateRule } from '../schemas';

interface RuleEditState extends BaseRuleState {}

interface RuleEditActions extends BaseRuleActions {
  getUpdateData: () => UpdateRule;
  initializeFromRule: (rule: Rule, products: any[]) => void;
}

export const useRuleEditStore = create<RuleEditState & RuleEditActions>()(
  devtools(
    (set, get) => ({
      ...createInitialState(),

      ...createCommonActions(set, get),

      ...createNameHandlers(set, get),
      ...createLeadFilterHandlers(set, get),
      ...createProductHandlers(set, get),
      ...createSendingSettingsHandlers(set, get),

      ...createInitializationService(set, get),
      ...createLeadValidationService(set, get),
      ...createRuleTestingService(set, get),

      getUpdateData: () => {
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

      initializeFromRule: (rule: Rule, products: any[]) => {
        get().initializeProducts(products);

        let filteredProducts: any[] = [];
        let productOptions: any[] = [];

        if (rule.leadVertical && rule.leadCountry) {
          filteredProducts = products.filter(
            (product: any) =>
              product.vertical === rule.leadVertical &&
              product.country === rule.leadCountry
          );

          productOptions = filteredProducts.map((product: any) => ({
            label: `${product.productName} (${product.vertical} - ${product.country} - ${product.aff})`,
            value: product.productId,
            uniqueKey:
              product.uniqueProductKey ||
              `${product.productId}-${product.vertical}-${product.country}-${product.aff}`,
            productId: product.productId,
            productName: product.productName,
            vertical: product.vertical,
            country: product.country,
            aff: product.aff,
          }));
        }

        set({
          name: rule.name || '',
          leadFilters: {
            leadStatus: rule.leadStatus || '',
            leadVertical: rule.leadVertical || '',
            leadCountry: rule.leadCountry || '',
            leadAffiliate: rule.leadAffiliate || '',
            leadDateFrom: rule.leadDateFrom || '',
            leadDateTo: rule.leadDateTo || '',
          },
          targetProduct: {
            targetProductId: rule.targetProductId || '',
            targetProductName: rule.targetProductName || '',
            targetProductVertical: rule.targetProductVertical || '',
            targetProductCountry: rule.targetProductCountry || '',
            targetProductAffiliate: rule.targetProductAffiliate || '',
          },
          sendingSettings: {
            dailyCapLimit: rule.dailyCapLimit?.toString() || '100',
            minIntervalMinutes: rule.minIntervalMinutes?.toString() || '5',
            maxIntervalMinutes: rule.maxIntervalMinutes?.toString() || '15',
            isInfinite: rule.isInfinite || false,
            sendWindowStart: rule.sendWindowStart || '09:00',
            sendWindowEnd: rule.sendWindowEnd || '18:00',
            sendDateFrom: rule.sendDateFrom || '',
            sendDateTo: rule.sendDateTo || '',
            isActive: rule.isActive ?? true,
            useEmail: rule.useEmail ?? false,
            usePhone: rule.usePhone ?? false,
            useRedirect: rule.useRedirect ?? true,
          },
          filteredProducts,
          productOptions,
          startDate: rule.leadDateFrom ? new Date(rule.leadDateFrom) : null,
          endDate: rule.leadDateTo ? new Date(rule.leadDateTo) : null,
          validationErrors: [],
        });

        setTimeout(() => {
          if (rule.leadVertical && rule.leadCountry) {
            get().updateAvailableAffiliates();
          }
        }, 100);
      },
    }),
    {
      name: 'rule-edit-store',
    }
  )
);
