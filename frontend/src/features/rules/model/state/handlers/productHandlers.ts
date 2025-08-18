import type { BaseRuleState } from '../shared/types';

export const createProductHandlers = (set: any, get: () => BaseRuleState) => ({
  handleTargetProductChange: (productId: string) => {
    const state = get();
    const selectedProduct = state.filteredProducts.find(
      (p: any) => p.productId === productId
    );

    if (selectedProduct) {
      set({
        targetProduct: {
          targetProductId: selectedProduct.productId,
          targetProductName: selectedProduct.productName,
          targetProductVertical: selectedProduct.vertical,
          targetProductCountry: selectedProduct.country,
          targetProductAffiliate: selectedProduct.aff,
        },
        validationErrors: [],
      });
    }
  },

  clearTargetProduct: () => {
    set({
      targetProduct: {
        targetProductId: '',
        targetProductName: '',
        targetProductVertical: '',
        targetProductCountry: '',
        targetProductAffiliate: '',
      },
      filteredProducts: [],
      productOptions: [],
      validationErrors: [],
    });
  },

  applyProductFilter: async () => {
    const state = get();

    if (!state.leadFilters.leadVertical || !state.leadFilters.leadCountry) {
      set({
        validationErrors: [
          'Для получения доступных продуктов необходимо указать вертикаль и страну в фильтрах лидов',
        ],
      });
      return;
    }

    set({ isProductsLoading: true, validationErrors: [] });

    try {
      // Use server-side filtering with query parameters
      const params = new URLSearchParams();
      params.append('vertical', state.leadFilters.leadVertical);
      params.append('country', state.leadFilters.leadCountry);

      const response = await fetch(
        `/api/external/get_products?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const filteredProducts = Array.isArray(data) ? data : data.data || data;

      const productOptions = filteredProducts.map((product: any) => ({
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

      set({
        filteredProducts,
        productOptions,
        isProductsLoading: false,
      });
    } catch (error) {
      console.error('Ошибка при получении отфильтрованных продуктов:', error);
      set({
        isProductsLoading: false,
        validationErrors: ['Не удалось получить список доступных продуктов'],
      });
    }
  },
});
