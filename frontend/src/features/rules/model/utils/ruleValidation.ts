import { UpdateRule } from '../schemas';

export const validateCreationForm = (formData: {
  name: string;
  productId: string;
  productName: string;
  from: string;
  to: string;
  dailyCapLimitFilter: string;
  isInfinite: boolean;
  startTime: string;
  endTime: string;
}): string[] => {
  const errors: string[] = [];

  if (!formData.name.trim()) {
    errors.push('Название правила обязательно');
  }
  if (!formData.productId.trim()) {
    errors.push('ID продукта обязателен');
  }
  if (!formData.productName.trim()) {
    errors.push('Название оффера обязательно');
  }

  const fromValue = parseInt(formData.from);
  const toValue = parseInt(formData.to);
  const dailyCapLimitValue = parseInt(formData.dailyCapLimitFilter);

  if (isNaN(fromValue) || fromValue < 0) {
    errors.push('Поле "От" должно быть числом >= 0');
  }
  if (isNaN(toValue) || toValue < 0) {
    errors.push('Поле "До" должно быть числом >= 0');
  }
  if (fromValue >= toValue) {
    errors.push('Значение "От" должно быть меньше значения "До"');
  }
  if (isNaN(dailyCapLimitValue) || dailyCapLimitValue < 1) {
    errors.push('Кап фильтр должен быть числом >= 1');
  }

  const timeRegex = /^\d{2}:\d{2}$/;
  if (!formData.isInfinite) {
    if (!timeRegex.test(formData.startTime)) {
      errors.push('Неверный формат времени начала (HH:MM)');
    }
    if (!timeRegex.test(formData.endTime)) {
      errors.push('Неверный формат времени окончания (HH:MM)');
    }
  }

  return errors;
};

export const validateEditForm = (formData: UpdateRule): string[] => {
  const errors: string[] = [];

  if (!formData.name?.trim()) {
    errors.push('Название правила обязательно');
  }

  const minInterval = formData.minInterval;
  const maxInterval = formData.maxInterval;
  const dailyCapLimit = formData.dailyCapLimit;

  if (minInterval !== undefined && (isNaN(minInterval) || minInterval < 0)) {
    errors.push('Поле "От" должно быть числом >= 0');
  }
  if (maxInterval !== undefined && (isNaN(maxInterval) || maxInterval < 0)) {
    errors.push('Поле "До" должно быть числом >= 0');
  }
  if (
    minInterval !== undefined &&
    maxInterval !== undefined &&
    minInterval >= maxInterval
  ) {
    errors.push('Значение "От" должно быть меньше значения "До"');
  }
  if (
    dailyCapLimit !== undefined &&
    (isNaN(dailyCapLimit) || dailyCapLimit < 1)
  ) {
    errors.push('Кап фильтр должен быть числом >= 1');
  }

  const timeRegex = /^\d{2}:\d{2}$/;
  if (formData.isInfinite !== true) {
    if (formData.sendWindowStart && !timeRegex.test(formData.sendWindowStart)) {
      errors.push('Неверный формат времени начала (HH:MM)');
    }
    if (formData.sendWindowEnd && !timeRegex.test(formData.sendWindowEnd)) {
      errors.push('Неверный формат времени окончания (HH:MM)');
    }
  }

  return errors;
};
