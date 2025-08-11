import { useCallback } from 'react';
import { useProducts } from '@/features/products/model/hooks';
import { CountryEnum, VerticalEnum } from '@/shared/utilities/enums';

export const useRuleFormOptions = () => {
  const { data: products = [] } = useProducts();

  const partnerPrograms = useCallback(() => {
    const uniquePartners = [...new Set(products.map((p) => p.aff))];
    return uniquePartners.map((partner) => ({
      label: partner,
      value: partner,
    }));
  }, [products]);

  const availableVerticals = useCallback(() => {
    return Object.values(VerticalEnum).map((vertical) => ({
      label: vertical,
      value: vertical,
    }));
  }, []);

  const availableCountries = useCallback(
    (selectedPartner?: string) => {
      if (!selectedPartner) {
        return Object.values(CountryEnum).map((country) => ({
          label: country,
          value: country,
        }));
      }

      const partnersCountries = products
        .filter((p) => p.aff === selectedPartner)
        .map((p) => p.country);

      const uniqueCountries = [...new Set(partnersCountries)];
      return uniqueCountries.map((country) => ({
        label: country,
        value: country,
      }));
    },
    [products]
  );

  const productOptions = useCallback(() => {
    return products.map((product) => ({
      label: product.productName,
      value: product.productId,
      productName: product.productName,
    }));
  }, [products]);

  return {
    partnerPrograms: partnerPrograms(),
    availableVerticals: availableVerticals(),
    availableCountries,
    productOptions: productOptions(),
    products,
  };
};

export const useRuleFormValidation = () => {
  const validateRequiredFields = useCallback(
    (data: {
      name?: string;
      product?: string;
      dailyCapLimitFilter?: string;
    }) => {
      const errors: string[] = [];

      if (!data.name?.trim()) {
        errors.push('Название правила обязательно');
      }

      if (!data.product?.trim()) {
        errors.push('ID продукта обязателен');
      }

      const dailyCapLimitValue = parseInt(data.dailyCapLimitFilter || '0');
      if (
        !data.dailyCapLimitFilter ||
        isNaN(dailyCapLimitValue) ||
        dailyCapLimitValue < 1
      ) {
        errors.push('Кап фильтр должен быть больше 0');
      }

      return errors;
    },
    []
  );

  const validateTimeRange = useCallback((from: string, to: string) => {
    const errors: string[] = [];
    const fromValue = parseInt(from);
    const toValue = parseInt(to);

    if (isNaN(fromValue) || fromValue < 0) {
      errors.push('Поле "От" должно быть числом >= 0');
    }

    if (isNaN(toValue) || toValue < 0) {
      errors.push('Поле "До" должно быть числом >= 0');
    }

    if (fromValue >= toValue) {
      errors.push('Значение "От" должно быть меньше значения "До"');
    }

    return errors;
  }, []);

  const validateTimeFormat = useCallback((time: string) => {
    const timeRegex = /^\d{2}:\d{2}$/;
    return timeRegex.test(time);
  }, []);

  return {
    validateRequiredFields,
    validateTimeRange,
    validateTimeFormat,
  };
};

export const useRuleFormProducts = () => {
  const { products, productOptions } = useRuleFormOptions();

  const getProductByProductId = useCallback(
    (productId: string) => {
      return products.find((p) => p.productId === productId);
    },
    [products]
  );

  const getPartnerByProductId = useCallback(
    (productId: string) => {
      const product = getProductByProductId(productId);
      return product?.aff || '';
    },
    [getProductByProductId]
  );

  return {
    products,
    productOptions,
    getProductByProductId,
    getPartnerByProductId,
  };
};
