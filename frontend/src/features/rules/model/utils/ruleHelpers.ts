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
    targetProductId: formData.productId,
    targetProductName: formData.productName.trim(),
    minIntervalMinutes: fromValue,
    maxIntervalMinutes: toValue,
    isActive: true,
    isInfinite: formData.isInfinite,
    dailyCapLimit: dailyCapLimitValue,
    ...(formData.isInfinite
      ? {}
      : {
          sendWindowStart: formData.startTime,
          sendWindowEnd: formData.endTime,
        }),
    leadVertical: formData.selectedVertical || undefined,
    leadCountry: formData.selectedCountry || undefined,
    leadStatus: formData.leadStatus || undefined,
  };
};

export const ruleToFormData = (rule: Rule): UpdateRule => {
  return {
    name: rule.name,
    targetProductName: rule.targetProductName,
    minIntervalMinutes: rule.minIntervalMinutes,
    maxIntervalMinutes: rule.maxIntervalMinutes,
    dailyCapLimit: rule.dailyCapLimit,
    sendWindowStart: rule.sendWindowStart,
    sendWindowEnd: rule.sendWindowEnd,
    isActive: rule.isActive,
    isInfinite: rule.isInfinite,
    leadVertical: rule.leadVertical,
    leadCountry: rule.leadCountry,
    leadStatus: rule.leadStatus,
  };
};

export const initializeEditForm = (rule: Rule, products: any[]) => {
  const foundProduct = products.find(
    (product) => product.productId === rule.targetProductId
  );

  return {
    formData: {
      name: rule.name,
      minIntervalMinutes: rule.minIntervalMinutes,
      maxIntervalMinutes: rule.maxIntervalMinutes,
      dailyCapLimit: rule.dailyCapLimit,
      sendWindowStart: rule.sendWindowStart,
      sendWindowEnd: rule.sendWindowEnd,
      isActive: rule.isActive,
      isInfinite: rule.isInfinite,
      leadVertical: rule.leadVertical,
      leadCountry: rule.leadCountry,
      leadStatus: rule.leadStatus,
      targetProductName: rule.targetProductName,
    },
    selectedPartner: foundProduct?.aff || '',
    selectedCountry: rule.leadCountry || '',
    selectedProduct: rule.targetProductId,
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
