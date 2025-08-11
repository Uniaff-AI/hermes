'use client';

import { FC, useState, useEffect } from 'react';
import {
  X,
  Filter,
  Settings,
  MessageSquare,
  Shield,
  Mail,
  Phone,
  Loader2,
  Infinity,
} from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select } from '@/shared/ui/select';
import { SelectWithSearch } from '@/shared/ui/select-with-search';
import { Checkbox } from '@/shared/ui/checkbox';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Rule } from '@/features/rules/model/schemas';
import { useUpdateRule } from '@/features/rules/model/hooks';
import { useProducts } from '@/features/products/model/hooks';
import { useRuleEditStore } from '@/features/rules/model/store';
import { StatusEnum, StatusTranslations } from '@/shared/utilities/enums';

interface RuleEditModalProps {
  rule: Rule | null;
  isOpen: boolean;
  onClose: () => void;
}

const RuleEditModal: FC<RuleEditModalProps> = ({ rule, isOpen, onClose }) => {
  const updateRuleMutation = useUpdateRule();
  const { data: products = [] } = useProducts();

  const {
    formData,
    selectedPartner,
    selectedCountry,
    selectedProduct,
    selectedTemplate,
    validationErrors,
    partnerPrograms,
    availableCountries,
    availableVerticals,
    productOptions,
    initializeFromRule,
    resetForm,
    validateForm,
    handleNameChange,
    handlePartnerChange,
    handleCountryChange,
    handleVerticalChange,
    handleStatusChange,
    handleActiveStatusChange,
    handleMinIntervalChange,
    handleMaxIntervalChange,
    handleDailyCapLimitChange,
    handleTimeChange,
    handleInfiniteChange,
    handleProductChange,
    handleProductNameChange,
  } = useRuleEditStore();

  // Инициализация формы при открытии модала
  useEffect(() => {
    if (rule && products.length > 0) {
      initializeFromRule(rule, products);
    }
  }, [rule, products, initializeFromRule]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!rule) return;

    if (!validateForm()) {
      return;
    }

    try {
      await updateRuleMutation.mutateAsync({ id: rule.id, data: formData });
      handleClose();
    } catch (error) {
      console.error('Ошибка при сохранении правила:', error);
    }
  };

  if (!rule) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="flex items-start justify-between pb-4 border-b border-gray-200">
          <div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Настройки правила: {rule.name}
            </DialogTitle>
            <div className="text-sm text-gray-600 mt-1">
              Изменение параметров правила редиректа
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Validation Errors Display */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-800 mb-2">
                Ошибки валидации:
              </h3>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Основные Настройки */}
          <section className="space-y-4">
            <header className="flex items-center gap-2 text-lg font-medium text-gray-800">
              <Filter className="w-5 h-5" />
              <span>Основные Настройки</span>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label>Название правила</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Введите название правила"
                />
                {validationErrors.includes('Название правила обязательно') && (
                  <p className="text-xs text-red-500 mt-1">
                    Название правила обязательно
                  </p>
                )}
              </div>
              <div>
                <Label>ПП (Партнёрская программа)</Label>
                <Select
                  placeholder="Выберите партнерскую программу"
                  value={selectedPartner}
                  onChange={handlePartnerChange}
                  options={partnerPrograms}
                />
              </div>
              <div>
                <Label>Вертикаль</Label>
                <Select
                  placeholder="Выберите вертикаль"
                  value={formData.vertical || ''}
                  onChange={handleVerticalChange}
                  options={availableVerticals}
                />
              </div>
              <div>
                <Label>Страна</Label>
                <Select
                  placeholder="Выберите страну"
                  value={formData.country || ''}
                  onChange={handleCountryChange}
                  options={availableCountries}
                  disabled={!selectedPartner}
                />
              </div>
              <div>
                <Label>ID Оффера</Label>
                <SelectWithSearch
                  placeholder="Выберите или введите ID оффера"
                  options={productOptions}
                  value={selectedProduct}
                  onChange={handleProductChange}
                  onLabelChange={handleProductNameChange}
                  displayMode="value"
                />
              </div>
              <div>
                <Label>Название оффера</Label>
                <Input
                  value={formData.productName || rule.productName}
                  readOnly
                  className="bg-gray-50"
                  placeholder="Название оффера"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Название оффера автоматически заполняется при выборе ID оффера
                </p>
              </div>
              <div>
                <Label>Статус</Label>
                <Select
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={handleActiveStatusChange}
                  options={[
                    { label: 'Активно', value: 'active' },
                    { label: 'Неактивно', value: 'inactive' },
                  ]}
                />
              </div>
              <div>
                <Label>Статус лида</Label>
                <Select
                  placeholder="Выберите статус лида"
                  value={formData.status || ''}
                  onChange={handleStatusChange}
                  options={Object.values(StatusEnum).map(status => ({
                    label: StatusTranslations[status] || status,
                    value: status,
                  }))}
                />
              </div>
            </div>
          </section>

          {/* Настройки Отправки */}
          <section className="pt-6 border-t border-gray-200 space-y-4">
            <header className="flex items-center gap-2 text-lg font-medium text-gray-800">
              <Settings className="w-5 h-5" />
              <span>Настройки Отправки</span>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>От (мин)</Label>
                  <Input
                    type="number"
                    value={formData.minInterval || 5}
                    onChange={(e) => handleMinIntervalChange(e.target.value)}
                    min="0"
                  />
                  {validationErrors.includes('Поле "От" должно быть числом >= 0') && (
                    <p className="text-xs text-red-500 mt-1">
                      Поле "От" должно быть числом &gt;= 0
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <Label>До (мин)</Label>
                  <Input
                    type="number"
                    value={formData.maxInterval || 15}
                    onChange={(e) => handleMaxIntervalChange(e.target.value)}
                    min="0"
                  />
                  {validationErrors.includes('Поле "До" должно быть числом >= 0') && (
                    <p className="text-xs text-red-500 mt-1">
                      Поле "До" должно быть числом &gt;= 0
                    </p>
                  )}
                  {validationErrors.includes('Значение "От" должно быть меньше значения "До"') && (
                    <p className="text-xs text-red-500 mt-1">
                      Значение "От" должно быть меньше значения "До"
                    </p>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Система будет отправлять лиды в случайном интервале между
                указанными значениями
              </div>

              {/* Бесконечная отправка */}
              <div className="lg:col-span-3">
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Infinity className="w-5 h-5 text-blue-600" />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.isInfinite || false}
                      onChange={(e) => handleInfiniteChange(e.target.checked)}
                    />
                    <span className="font-medium text-blue-800">Бесконечная отправка</span>
                  </label>
                  <span className="text-sm text-blue-600">
                    Правило будет работать непрерывно 24/7 без временных ограничений до удаления или установки паузы.
                    Дневной лимит лидов остается обязательным для контроля нагрузки.
                  </span>
                </div>
              </div>

              <div>
                <Label>Кап фильтр (лидов в день) *</Label>
                <Input
                  type="number"
                  value={formData.dailyCapLimit || 100}
                  onChange={(e) => handleDailyCapLimitChange(e.target.value)}
                  min="1"
                  max="10000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ограничивает количество лидов в день для контроля нагрузки (1-10000)
                </p>
                {validationErrors.includes('Кап фильтр должен быть числом >= 1') && (
                  <p className="text-xs text-red-500 mt-1">
                    Кап фильтр должен быть числом &gt;= 1
                  </p>
                )}
              </div>
              <div>
                <Label>Начало периода отправки</Label>
                <Input
                  type="time"
                  value={formData.sendWindowStart || '09:00'}
                  onChange={(e) => handleTimeChange('sendWindowStart', e.target.value)}
                  disabled={formData.isInfinite}
                  className={formData.isInfinite ? 'bg-gray-50 text-gray-400' : ''}
                />
                {formData.isInfinite && (
                  <p className="text-xs text-gray-500 mt-1">
                    При бесконечной отправке временные ограничения отключены
                  </p>
                )}
                {validationErrors.includes('Неверный формат времени начала (HH:MM)') && (
                  <p className="text-xs text-red-500 mt-1">
                    Неверный формат времени начала (HH:MM)
                  </p>
                )}
              </div>
              <div>
                <Label>Конец периода отправки</Label>
                <Input
                  type="time"
                  value={formData.sendWindowEnd || '18:00'}
                  onChange={(e) => handleTimeChange('sendWindowEnd', e.target.value)}
                  disabled={formData.isInfinite}
                  className={formData.isInfinite ? 'bg-gray-50 text-gray-400' : ''}
                />
                {formData.isInfinite && (
                  <p className="text-xs text-gray-500 mt-1">
                    При бесконечной отправке временные ограничения отключены
                  </p>
                )}
                {validationErrors.includes('Неверный формат времени окончания (HH:MM)') && (
                  <p className="text-xs text-red-500 mt-1">
                    Неверный формат времени окончания (HH:MM)
                  </p>
                )}
              </div>
              <div className="lg:col-span-3">
                <Label>Методы отправки</Label>
                <div className="flex items-center gap-6 mt-2">
                  <label className="flex items-center gap-2">
                    <Checkbox defaultChecked />
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox />
                    <Phone className="w-4 h-4" />
                    <span>Телефон</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Настройка сообщения */}
          <section className="pt-6 border-t border-gray-200 space-y-4">
            <header className="flex items-center gap-2 text-lg font-medium text-gray-800">
              <MessageSquare className="w-5 h-5" />
              <span>Настройка сообщения</span>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label>Тип сообщения</Label>
                <Select
                  value="template"
                  onChange={() => { }}
                  options={[
                    { label: 'Из готовых шаблонов', value: 'template' },
                    { label: 'Кастомное сообщение', value: 'custom' },
                  ]}
                />
              </div>
              <div>
                <Label>Выберите шаблон</Label>
                <Select
                  placeholder="Выберите готовое сообщение"
                  value={selectedTemplate}
                  onChange={(value) => useRuleEditStore.getState().setSelectedTemplate(value)}
                  options={[
                    { label: 'Welcome template', value: 'welcome' },
                    { label: 'Follow-up template', value: 'followup' },
                  ]}
                />
              </div>
            </div>
          </section>

          {/* Интеграция с Keitaro */}
          <section className="pt-6 border-t border-gray-200 space-y-4">
            <header className="flex items-center gap-2 text-lg font-medium text-gray-800">
              <Shield className="w-5 h-5 text-blue-500" />
              <span>Интеграция с Keitaro</span>
            </header>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="font-medium text-blue-700 mb-2">
                    Учет основного трафика
                  </div>
                  <p className="text-sm text-blue-900 mb-4">
                    Система автоматически учитывает объем основного трафика из
                    Keitaro и догружает лиды в соответствии с установленными
                    лимитами.
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-blue-700">
                        Группа офферов в Keitaro
                      </Label>
                      <Select
                        placeholder="Выберите группу"
                        value=""
                        onChange={() => { }}
                        options={[
                          { label: 'Forex Group', value: 'forex' },
                          { label: 'Crypto Group', value: 'crypto' },
                        ]}
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-blue-700">
                        Текущий объем (сегодня)
                      </Label>
                      <Input value="47" readOnly className="bg-gray-50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Кнопки действий */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-8">
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateRuleMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {updateRuleMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Сохранение...
              </>
            ) : (
              'Сохранить изменения'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RuleEditModal;
