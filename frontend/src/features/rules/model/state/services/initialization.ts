import { StatusEnum } from '@/shared/utilities/enums';
import type { BaseRuleState } from '../shared/types';
import type { Rule } from '../../schemas';

export const createInitializationService = (
  set: any,
  get: () => BaseRuleState & { updateAvailableAffiliates: () => Promise<void> }
) => ({
  initializeProducts: (products: any[]) => {
    const uniqueVerticals = [...new Set(products.map((p: any) => p.vertical))];
    const uniqueCountries = [...new Set(products.map((p: any) => p.country))];
    const uniqueAffiliates = [...new Set(products.map((p: any) => p.aff))];

    set({
      products,
      productOptions: [],
      leadFilterOptions: {
        statuses: Object.values(StatusEnum).map((status) => ({
          label: status === 'ALL' ? 'Все статусы' : status,
          value: status,
        })),
        verticals: uniqueVerticals.map((vertical: any) => ({
          label: vertical,
          value: vertical,
        })),
        countries: uniqueCountries.map((country: any) => ({
          label: country,
          value: country,
        })),
        affiliates: uniqueAffiliates.map((aff: any) => ({
          label: aff,
          value: aff,
        })),
      },
    });

    setTimeout(() => {
      get().updateAvailableAffiliates();
    }, 100);
  },

  initializeFromRule: (rule: Rule, products: any[]) => {
    const uniqueVerticals = [...new Set(products.map((p: any) => p.vertical))];
    const uniqueCountries = [...new Set(products.map((p: any) => p.country))];
    const uniqueAffiliates = [...new Set(products.map((p: any) => p.aff))];

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
      products,
      filteredProducts,
      productOptions,
      leadFilterOptions: {
        statuses: Object.values(StatusEnum).map((status) => ({
          label: status === 'ALL' ? 'Все статусы' : status,
          value: status,
        })),
        verticals: uniqueVerticals.map((vertical: any) => ({
          label: vertical,
          value: vertical,
        })),
        countries: uniqueCountries.map((country: any) => ({
          label: country,
          value: country,
        })),
        affiliates: uniqueAffiliates.map((aff: any) => ({
          label: aff,
          value: aff,
        })),
      },
      startDate: rule.leadDateFrom ? new Date(rule.leadDateFrom) : null,
      endDate: rule.leadDateTo ? new Date(rule.leadDateTo) : null,
      validationErrors: [],
    });
  },
});
