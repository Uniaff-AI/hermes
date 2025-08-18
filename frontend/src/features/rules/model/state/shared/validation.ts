import type { BaseRuleState } from './types';

export const validateName = (name: string): string[] => {
  const errors: string[] = [];
  if (!name.trim()) {
    errors.push('Название правила обязательно');
  }
  return errors;
};

export const validateTargetProduct = (
  targetProduct: BaseRuleState['targetProduct']
): string[] => {
  const errors: string[] = [];
  if (!targetProduct.targetProductId) {
    errors.push('Целевой продукт обязателен');
  }
  return errors;
};

export const validateCountryMatch = (
  leadCountry: string,
  targetCountry: string
): string[] => {
  const errors: string[] = [];
  const hasLeadCountry = leadCountry && leadCountry.trim() !== '';
  const hasTargetCountry = targetCountry && targetCountry.trim() !== '';

  if (hasLeadCountry && hasTargetCountry && leadCountry !== targetCountry) {
    errors.push(
      `Несоответствие стран: нельзя перенаправлять лиды из ${leadCountry} на продукт для ${targetCountry}. Страны должны совпадать.`
    );
  }
  return errors;
};

export const validateSendingSettings = (
  sendingSettings: BaseRuleState['sendingSettings']
): string[] => {
  const errors: string[] = [];

  const dailyCapLimit = parseInt(sendingSettings.dailyCapLimit);
  if (isNaN(dailyCapLimit) || dailyCapLimit < 1) {
    errors.push('Дневной лимит должен быть больше 0');
  }

  const minIntervalMinutes = parseInt(sendingSettings.minIntervalMinutes);
  const maxIntervalMinutes = parseInt(sendingSettings.maxIntervalMinutes);
  if (minIntervalMinutes >= maxIntervalMinutes) {
    errors.push('Минимальный интервал должен быть меньше максимального');
  }

  if (!sendingSettings.isInfinite) {
    if (!sendingSettings.sendWindowStart || !sendingSettings.sendWindowEnd) {
      errors.push('Временные окна обязательны для небесконечной отправки');
    }
  }

  if (
    !sendingSettings.useEmail &&
    !sendingSettings.usePhone &&
    !sendingSettings.useRedirect
  ) {
    errors.push('Необходимо выбрать хотя бы один метод отправки');
  }

  return errors;
};

export const validateProductExists = (
  targetProduct: BaseRuleState['targetProduct'],
  products: any[]
): string[] => {
  const errors: string[] = [];

  if (targetProduct.targetProductId && targetProduct.targetProductName) {
    const productExists = products.some(
      (product: any) => product.productId === targetProduct.targetProductId
    );

    if (!productExists) {
      errors.push(
        `Продукт "${targetProduct.targetProductName}" (ID: ${targetProduct.targetProductId}) не найден в списке доступных продуктов. Возможно, продукт был удален или недоступен.`
      );
    }
  }

  return errors;
};

export const validateForm = (state: BaseRuleState): string[] => {
  const errors: string[] = [];

  errors.push(...validateName(state.name));

  errors.push(...validateTargetProduct(state.targetProduct));

  errors.push(
    ...validateCountryMatch(
      state.leadFilters.leadCountry,
      state.targetProduct.targetProductCountry
    )
  );

  errors.push(...validateSendingSettings(state.sendingSettings));

  errors.push(...validateProductExists(state.targetProduct, state.products));

  if (state.leadFilters.leadVertical && state.leadFilters.leadCountry) {
    const availableAffiliates = state.leadFilterOptions.affiliates
      .filter((aff) => aff.value !== '')
      .map((aff) => aff.value);

    if (
      state.leadFilters.leadAffiliate &&
      !availableAffiliates.includes(state.leadFilters.leadAffiliate)
    ) {
      errors.push(
        'Выбранный аффилиат недоступен для указанных параметров фильтрации. Обновите список аффилиатов.'
      );
    }
  }

  return errors;
};
