import { CreateRuleRequest, Rule, UpdateRule } from '../schemas';

export const createSubmitData = (formData: {
  name: string;
  productId: string;
  productName: string;
  from: string;
  to: string;
  dailyCapLimitFilter: string;
  isInfinite: boolean;
  startTime: string;
  endTime: string;
  selectedVertical: string;
  selectedCountry: string;
  leadStatus: string;
}): CreateRuleRequest => {
  const fromValue = parseInt(formData.from);
  const toValue = parseInt(formData.to);
  const dailyCapLimitValue = parseInt(formData.dailyCapLimitFilter);

  return {
    name: formData.name.trim(),
    productId: formData.productId,
    productName: formData.productName.trim(),
    periodMinutes: 1440, // Фиксированное значение 24 часа (1440 минут)
    minInterval: fromValue,
    maxInterval: toValue,
    isActive: true, // По умолчанию активно
    isInfinite: formData.isInfinite,
    dailyCapLimit: dailyCapLimitValue,
    ...(formData.isInfinite
      ? {}
      : {
          sendWindowStart: formData.startTime,
          sendWindowEnd: formData.endTime,
        }),
    vertical: formData.selectedVertical || undefined,
    country: formData.selectedCountry || undefined,
    status: formData.leadStatus || undefined,
  };
};

export const ruleToFormData = (rule: Rule): UpdateRule => {
  return {
    name: rule.name,
    productName: rule.productName,
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
  };
};

export const initializeEditForm = (rule: Rule, products: any[]) => {
  const foundProduct = products.find(
    (product) => product.productId === rule.productId
  );

  return {
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
    selectedTemplate: '',
  };
};

export const clearValidationError = (
  errors: string[],
  fieldName: string
): string[] => {
  return errors.filter((error) => !error.includes(fieldName));
};

export const validateNumericField = (
  value: string,
  min: number,
  max: number
): boolean => {
  const numValue = parseInt(value);
  return (
    value === '' || (!isNaN(numValue) && numValue >= min && numValue <= max)
  );
};

export const validateTimeFormat = (time: string): boolean => {
  const timeRegex = /^\d{2}:\d{2}$/;
  return timeRegex.test(time);
};
