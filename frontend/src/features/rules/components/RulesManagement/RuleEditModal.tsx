'use client';

import { FC, useState, useEffect } from 'react';
import {
  X,
  Filter,
  Settings,
  Shield,
  Loader2,
  Infinity,
  Target,
  RotateCcw,
  User,
  Package,
  Mail,
  Phone,
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
import { useRuleEditStore } from '@/features/rules/model/state';
import CompactValidationResult from './CompactValidationResult';
import LeadValidationResult from './LeadValidationResult';
import AffiliateCompatibilityWarning from './AffiliateCompatibilityWarning';
import { convertTimeToHH_MM } from '@/features/rules/model/utils';

interface RuleEditModalNewProps {
  rule: Rule | null;
  isOpen: boolean;
  onClose: () => void;
}

const RuleEditModalNew: FC<RuleEditModalNewProps> = ({ rule, isOpen, onClose }) => {
  const updateRuleMutation = useUpdateRule();
  const { data: products = [] } = useProducts();

  const {
    name,
    leadFilters,
    targetProduct,
    sendingSettings,
    validationErrors,
    ruleTest,
    leadValidation,
    leadFilterOptions,
    productOptions,
    isProductsLoading,

    // Actions
    resetForm,
    validateForm,
    getUpdateData,
    testRule,
    resetRuleTest,
    setValidationErrors,
    checkLeadExistence,
    resetLeadValidation,
    refreshAvailableAffiliates,

    // Section 1: Name
    handleNameChange,

    // Section 2: Lead Filters
    handleLeadStatusChange,
    handleLeadVerticalChange,
    handleLeadCountryChange,
    handleLeadAffiliateChange,
    handleLeadDateFromChange,
    handleLeadDateToChange,
    clearLeadFilters,

    // Section 3: Target Product
    handleTargetProductChange,
    clearTargetProduct,
    applyProductFilter,

    // Sending Settings
    handleDailyCapLimitChange,
    handleMinIntervalMinutesChange,
    handleMaxIntervalMinutesChange,
    handleIsInfiniteChange,
    handleIsActiveChange,
    handleSendWindowStartChange,
    handleSendWindowEndChange,
    handleSendDateFromChange,
    handleSendDateToChange,
    handleUseEmailChange,
    handleUsePhoneChange,
    handleUseRedirectChange,

    // Initialization
    initializeProducts,
    initializeFromRule,
  } = useRuleEditStore();

  // Initialise the form when opening the modal
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

    if (!(await validateForm())) {
      return;
    }

    try {
      const updateData = getUpdateData();

      console.log('Sending update data:', updateData);

      await updateRuleMutation.mutateAsync({
        id: rule.id,
        data: updateData
      });

      handleClose();
    } catch (error) {
      console.error('Ошибка при сохранении правила:', error);
    }
  };

  if (!rule) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="flex items-start justify-between pb-4 border-b border-gray-200">
          <div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Настройки правила: {rule.name}
            </DialogTitle>
            <div className="text-sm text-gray-600 mt-1">
              Изменение параметров правила редиректа по новой логике
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Validation Errors Display */}
          <CompactValidationResult
            isVisible={validationErrors.length > 0}
            type="error"
            title="Ошибки валидации"
            message="Пожалуйста, исправьте следующие ошибки:"
            errors={validationErrors}
            onClose={() => setValidationErrors([])}
          />

          {/* Секция 1: Название правила */}
          <section className="space-y-4">
            <header className="flex items-center gap-2 text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>1. Название Правила</span>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Input
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Введите название правила"
                    className="max-w-md"
                  />
                </div>
              </div>
            </header>
          </section>

          {/* Секция 2: Определение Лида (get_leads фильтры) */}
          <section className="space-y-6">
            <header className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div className="flex items-center gap-2 text-lg font-medium text-gray-800">
                <User className="w-5 h-5 text-green-600" />
                <span>2. Определение Лида (Фильтрация get_leads)</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={checkLeadExistence}
                  disabled={leadValidation.isChecking}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  {leadValidation.isChecking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Проверка...
                    </>
                  ) : (
                    <>
                      <Filter className="w-4 h-4 mr-1" />
                      Проверить лиды
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearLeadFilters}
                  className="text-gray-600"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Очистить фильтры
                </Button>
              </div>
            </header>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Логика:</strong> Эти фильтры определяют, какие лиды будут отобраны из системы
                для отправки на целевой продукт.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <div>
                <Label>Статус лида</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      placeholder="Выберите статус лида"
                      value={leadFilters.leadStatus}
                      onChange={handleLeadStatusChange}
                      options={leadFilterOptions.statuses}
                    />
                  </div>
                  {leadFilters.leadStatus && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeadStatusChange('')}
                      className="px-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label>Вертикаль</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      placeholder="Выберите вертикаль"
                      value={leadFilters.leadVertical}
                      onChange={handleLeadVerticalChange}
                      options={leadFilterOptions.verticals}
                    />
                  </div>
                  {leadFilters.leadVertical && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeadVerticalChange('')}
                      className="px-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label>Страна</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      placeholder="Выберите страну"
                      value={leadFilters.leadCountry}
                      onChange={handleLeadCountryChange}
                      options={leadFilterOptions.countries}
                    />
                  </div>
                  {leadFilters.leadCountry && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeadCountryChange('')}
                      className="px-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label>Партнерская Программа</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      placeholder="Выберите ПП"
                      value={leadFilters.leadAffiliate}
                      onChange={handleLeadAffiliateChange}
                      options={leadFilterOptions.affiliates}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={refreshAvailableAffiliates}
                    disabled={!leadFilters.leadVertical || !leadFilters.leadCountry}
                    className="px-2"
                    title="Обновить список доступных аффилиатов"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  {leadFilters.leadAffiliate && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeadAffiliateChange('')}
                      className="px-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {leadFilters.leadVertical && leadFilters.leadCountry && leadFilters.leadAffiliate && (
                  <div className="mt-2">
                    <AffiliateCompatibilityWarning
                      vertical={leadFilters.leadVertical}
                      country={leadFilters.leadCountry}
                      selectedAffiliate={leadFilters.leadAffiliate}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label>Период от</Label>
                <Input
                  type="date"
                  value={leadFilters.leadDateFrom}
                  onChange={(e) => handleLeadDateFromChange(e.target.value ? new Date(e.target.value) : null)}
                  placeholder="Дата начала"
                />
              </div>

              <div>
                <Label>Период до</Label>
                <Input
                  type="date"
                  value={leadFilters.leadDateTo}
                  onChange={(e) => handleLeadDateToChange(e.target.value ? new Date(e.target.value) : null)}
                  placeholder="Дата окончания"
                />
              </div>
            </div>

            {/* Результат валидации лидов */}
            <LeadValidationResult
              isVisible={leadValidation.result !== 'idle'}
              result={leadValidation.result}
              message={leadValidation.message}
              leadCount={leadValidation.leadCount}
              sampleLeads={leadValidation.sampleLeads}
              onClose={resetLeadValidation}
            />
          </section>

          {/* Секция 3: Целевой Продукт */}
          <section className="space-y-6">
            <header className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div className="flex items-center gap-2 text-lg font-medium text-gray-800">
                <Package className="w-5 h-5 text-purple-600" />
                <span>3. Целевой Продукт (get_products)</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={applyProductFilter}
                  disabled={isProductsLoading || !leadFilters.leadVertical || !leadFilters.leadCountry}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  {isProductsLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Filter className="w-4 h-4 mr-1" />
                      Применить фильтр
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearTargetProduct}
                  className="text-gray-600"
                  disabled={!targetProduct.targetProductId}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Очистить продукт
                </Button>
              </div>
            </header>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                <strong>Логика:</strong> Сначала определите вертикаль и страну в фильтрах лидов, затем нажмите "Применить фильтр"
                для получения доступных продуктов. При выборе продукта автоматически заполняются связанные поля.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label>ID Продукта *</Label>
                <SelectWithSearch
                  placeholder={productOptions.length > 0 ? "Выберите целевой продукт из списка" : "Сначала примените фильтр для получения списка продуктов"}
                  options={productOptions}
                  value={targetProduct.targetProductId}
                  onChange={handleTargetProductChange}
                  displayMode="value"
                  disabled={productOptions.length === 0}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {productOptions.length > 0
                    ? "Выберите продукт из выпадающего списка"
                    : "Для получения списка продуктов укажите вертикаль и страну в фильтрах лидов и нажмите 'Применить фильтр'"
                  }
                </p>
              </div>

              <div>
                <Label>Название продукта</Label>
                <Input
                  placeholder="Автоматически заполняется"
                  value={targetProduct.targetProductName}
                  readOnly
                  className="bg-gray-50"
                />
              </div>

              {/* Критерии совпадения - отображаются всегда */}
              <div>
                <Label>Вертикаль продукта (критерий совпадения)</Label>
                <Input
                  value={targetProduct.targetProductVertical}
                  readOnly
                  className="bg-blue-50 border-blue-200"
                />
                <p className="text-xs text-blue-600 mt-1">
                  Автоматически из фильтров лидов - критерий совпадения
                </p>
              </div>

              <div>
                <Label>Страна продукта (критерий совпадения)</Label>
                <Input
                  value={targetProduct.targetProductCountry}
                  readOnly
                  className="bg-blue-50 border-blue-200"
                />
                <p className="text-xs text-blue-600 mt-1">
                  Автоматически из фильтров лидов - критерий совпадения
                </p>
              </div>

              {/* ПП продукта - отображается только после выбора продукта */}
              {targetProduct.targetProductId && (
                <div>
                  <Label>ПП продукта</Label>
                  <Input
                    value={targetProduct.targetProductAffiliate}
                    readOnly
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Автоматически из выбранного продукта
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Настройки отправки */}
          <section className="space-y-6">
            <header className="flex items-center gap-2 text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">
              <Settings className="w-5 h-5 text-orange-600" />
              <span>Настройки Отправки</span>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label>Статус правила</Label>
                <Select
                  value={sendingSettings.isActive ? 'active' : 'inactive'}
                  onChange={(value) => handleIsActiveChange(value === 'active')}
                  options={[
                    { label: 'Активно', value: 'active' },
                    { label: 'Неактивно', value: 'inactive' },
                  ]}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Активные правила работают, неактивные - приостановлены
                </p>
              </div>

              <div>
                <Label>Дневной лимит *</Label>
                <Input
                  type="number"
                  value={sendingSettings.dailyCapLimit}
                  onChange={(e) => handleDailyCapLimitChange(e.target.value)}
                  min="1"
                  max="10000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Максимум лидов в день (1-10000)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>От (мин)</Label>
                  <Input
                    type="number"
                    value={sendingSettings.minIntervalMinutes}
                    onChange={(e) => handleMinIntervalMinutesChange(e.target.value)}
                    min="1"
                    max="1440"
                  />
                </div>
                <div className="flex-1">
                  <Label>До (мин)</Label>
                  <Input
                    type="number"
                    value={sendingSettings.maxIntervalMinutes}
                    onChange={(e) => handleMaxIntervalMinutesChange(e.target.value)}
                    min="1"
                    max="1440"
                  />
                </div>
              </div>
            </div>

            {/* Бесконечная отправка */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Infinity className="w-5 h-5 text-blue-600" />
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={sendingSettings.isInfinite}
                  onChange={(e) => handleIsInfiniteChange(e.target.checked)}
                />
                <span className="font-medium text-blue-800">Бесконечная отправка</span>
              </label>
              <span className="text-sm text-blue-600">
                Правило будет работать непрерывно 24/7 без временных ограничений.
              </span>
            </div>

            {/* Методы отправки */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label>Методы отправки</Label>
                <div className="flex items-center gap-6 mt-2">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={sendingSettings.useEmail}
                      onChange={(e) => handleUseEmailChange(e.target.checked)}
                    />
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={sendingSettings.usePhone}
                      onChange={(e) => handleUsePhoneChange(e.target.checked)}
                    />
                    <Phone className="w-4 h-4" />
                    <span>SMS</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={sendingSettings.useRedirect}
                      onChange={(e) => handleUseRedirectChange(e.target.checked)}
                    />
                    <Target className="w-4 h-4" />
                    <span>Редирект</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Временные окна (только если не бесконечная отправка) */}
            {!sendingSettings.isInfinite && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label>Время начала отправки</Label>
                  <Input
                    type="time"
                    value={sendingSettings.sendWindowStart}
                    onChange={(e) => {
                      // Автоматически конвертируем в 24-часовой формат при изменении
                      const convertedTime = convertTimeToHH_MM(e.target.value);
                      handleSendWindowStartChange(convertedTime);
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Время автоматически конвертируется в 24-часовой формат
                  </p>
                </div>
                <div>
                  <Label>Время окончания отправки</Label>
                  <Input
                    type="time"
                    value={sendingSettings.sendWindowEnd}
                    onChange={(e) => {
                      // Автоматически конвертируем в 24-часовой формат при изменении
                      const convertedTime = convertTimeToHH_MM(e.target.value);
                      handleSendWindowEndChange(convertedTime);
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Время автоматически конвертируется в 24-часовой формат
                  </p>
                </div>
              </div>
            )}

            {/* Даты отправки */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label>Дата начала отправки</Label>
                <Input
                  type="date"
                  value={sendingSettings.sendDateFrom}
                  onChange={(e) => handleSendDateFromChange(e.target.value ? new Date(e.target.value) : null)}
                  placeholder="Дата начала отправки"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Оставьте пустым для отправки с сегодняшнего дня
                </p>
              </div>
              <div>
                <Label>Дата окончания отправки</Label>
                <Input
                  type="date"
                  value={sendingSettings.sendDateTo}
                  onChange={(e) => handleSendDateToChange(e.target.value ? new Date(e.target.value) : null)}
                  placeholder="Дата окончания отправки"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Оставьте пустым для бессрочной отправки
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Кнопки действий */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
          <Button
            variant="outline"
            onClick={resetForm}
            className="text-gray-600 hover:text-gray-800"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Сбросить все поля
          </Button>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button
              variant="outline"
              onClick={testRule}
              disabled={ruleTest.isTesting || updateRuleMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {ruleTest.isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Тестирование...
                </>
              ) : (
                'Тест правила'
              )}
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
        </div>

        {/* Результаты тестирования - под кнопками */}
        <div className="mt-4">
          <CompactValidationResult
            isVisible={ruleTest.result !== 'idle'}
            type={ruleTest.result === 'success' ? 'success' : 'error'}
            title={ruleTest.result === 'success' ? 'Тест пройден' : 'Ошибки валидации'}
            message={ruleTest.message}
            errors={ruleTest.validationErrors}
            onClose={resetRuleTest}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RuleEditModalNew;
