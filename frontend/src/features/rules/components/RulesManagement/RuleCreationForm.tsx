'use client';

import { FC, useEffect } from 'react';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select } from '@/shared/ui/select';
import { SelectWithSearch } from '@/shared/ui/select-with-search';
import { Checkbox } from '@/shared/ui/checkbox';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { DateTimePicker } from '@/shared/ui/date-time-picker';
import { Filter, Settings, MessageSquare, Shield, Loader2, Infinity } from 'lucide-react';
import AllRulesView from '@/features/rules/components/RulesManagement/AllRulesView';
import { useCreateRule } from '@/features/rules/model/hooks';
import { useProducts } from '@/features/products/model/hooks';
import { useRuleCreationStore } from '@/features/rules/model/store';
import { StatusEnum, StatusTranslations } from '@/shared/utilities/enums';

const RuleCreationForm: FC = () => {
  const createRuleMutation = useCreateRule();
  const { data: products = [] } = useProducts();

  const {
    name,
    selectedPartner,
    selectedCountry,
    selectedVertical,
    productId,
    productName,
    status,
    leadStatus,
    messageType,
    template,
    from,
    to,
    dailyCapLimitFilter,
    isInfinite,
    startTime,
    endTime,
    startDate,
    endDate,
    useEmail,
    usePhone,
    validationErrors,
    partnerPrograms,
    availableCountries,
    availableVerticals,
    productOptions,
    initializeProducts,
    resetForm,
    validateForm,
    getSubmitData,
    handleNameChange,
    handlePartnerChange,
    handleCountryChange,
    handleVerticalChange,
    handleProductChange,
    handleProductNameChange,
    handleFromChange,
    handleToChange,
    handleDailyCapLimitFilterChange,
    handleStartTimeChange,
    handleEndTimeChange,
    handleIsInfiniteChange,
    handleUseEmailChange,
    handleUsePhoneChange,
    handleStartDateChange,
    handleEndDateChange,
  } = useRuleCreationStore();

  // Инициализация продуктов при загрузке
  useEffect(() => {
    if (products.length > 0) {
      initializeProducts(products);
    }
  }, [products, initializeProducts]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const ruleData = getSubmitData();
      await createRuleMutation.mutateAsync(ruleData);
      resetForm();
    } catch (error) {
      console.error('Ошибка при создании правила:', error);
    }
  };

  return (
    <Card className="space-y-8 bg-white p-8 rounded-2xl border">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          Создание Нового Правила
        </h2>
        <p className="text-sm text-gray-600">
          Настройте фильтры и параметры отправки лидов
        </p>
      </div>

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

      <section className="space-y-6">
        <header className="flex items-center gap-2 text-lg font-medium text-gray-800">
          <Filter className="w-5 h-5" />
          <span>Фильтры</span>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Label>Название правила *</Label>
            <Input
              placeholder="Введите название правила"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
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
              value={selectedVertical}
              onChange={handleVerticalChange}
              options={availableVerticals}
            />
          </div>
          <div>
            <Label>Гео (список геолокаций стран)</Label>
            <Select
              placeholder="Выберите страну"
              value={selectedCountry}
              onChange={handleCountryChange}
              options={availableCountries}
              disabled={!selectedPartner}
            />
          </div>
          <div>
            <Label>ID Оффера *</Label>
            <SelectWithSearch
              placeholder="Выберите или введите ID оффера"
              options={productOptions}
              value={productId}
              onChange={handleProductChange}
              onLabelChange={handleProductNameChange}
              displayMode="value"
            />
          </div>
          <div>
            <Label>Название оффера *</Label>
            <Input
              placeholder="Название оффера заполнится автоматически при выборе ID"
              value={productName}
              onChange={(e) => handleProductNameChange(e.target.value)}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <div>
            <Label>Статус</Label>
            <Select
              placeholder="Выберите статус"
              value={status}
              onChange={(value) => useRuleCreationStore.getState().setStatus(value)}
              options={[
                { label: 'Активно', value: 'active' },
                { label: 'Пауза', value: 'paused' },
              ]}
            />
          </div>
          <div>
            <Label>Статус лида</Label>
            <Select
              placeholder="Выберите статус лида"
              value={leadStatus}
              onChange={(value) => useRuleCreationStore.getState().setLeadStatus(value)}
              options={Object.values(StatusEnum).map(status => ({
                label: StatusTranslations[status] || status,
                value: status,
              }))}
            />
          </div>
        </div>
      </section>

      <section className="pt-6 border-t border-gray-200 space-y-4">
        <header className="flex items-center gap-2 text-lg font-medium text-gray-800">
          <Settings className="w-5 h-5" />
          <span>Настройки Отправки</span>
        </header>

        {/* Бесконечная отправка */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Infinity className="w-5 h-5 text-blue-600" />
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={isInfinite}
              onChange={(e) => handleIsInfiniteChange(e.target.checked)}
            />
            <span className="font-medium text-blue-800">Бесконечная отправка</span>
          </label>
          <span className="text-sm text-blue-600">
            Правило будет работать непрерывно 24/7 без временных ограничений до удаления или установки паузы.
            Дневной лимит лидов остается обязательным для контроля нагрузки.
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>От (мин)</Label>
              <Input
                type="number"
                value={from}
                onChange={(e) => handleFromChange(e.target.value)}
                min="0"
                max="1440"
                placeholder="0"
              />
            </div>
            <div className="flex-1">
              <Label>До (мин)</Label>
              <Input
                type="number"
                value={to}
                onChange={(e) => handleToChange(e.target.value)}
                min="0"
                max="1440"
                placeholder="15"
              />
            </div>
          </div>

          <div>
            <Label>Кап фильтр (лидов в день) *</Label>
            <Input
              type="number"
              placeholder="Например: 100"
              value={dailyCapLimitFilter}
              onChange={(e) => handleDailyCapLimitFilterChange(e.target.value)}
              min="1"
              max="10000"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ограничивает количество лидов в день для контроля нагрузки (1-10000)
            </p>
          </div>

          <div>
            <Label>Методы отправки</Label>
            <div className="flex items-center gap-6 mt-2">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={useEmail}
                  onChange={(e) => handleUseEmailChange(e.target.checked)}
                />
                <span>Email</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={usePhone}
                  onChange={(e) => handleUsePhoneChange(e.target.checked)}
                />
                <span>Телефон</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <DateTimePicker
              label="Период действия - Начало"
              date={startDate}
              time={startTime}
              onDateChange={handleStartDateChange}
              onTimeChange={handleStartTimeChange}
              disabled={isInfinite}
              placeholder="Выберите дату начала"
            />
          </div>
          <div>
            <DateTimePicker
              label="Период действия - Конец"
              date={endDate}
              time={endTime}
              onDateChange={handleEndDateChange}
              onTimeChange={handleEndTimeChange}
              disabled={isInfinite}
              placeholder="Выберите дату окончания"
            />
          </div>
        </div>
      </section>

      <section className="pt-8 border-t border-gray-200 space-y-6">
        <header className="flex items-center gap-2 text-lg font-medium text-gray-800">
          <MessageSquare className="w-5 h-5" />
          <span>Настройка Сообщения</span>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Label>Тип сообщения</Label>
            <Select
              placeholder="Из готовых шаблонов"
              value={messageType}
              onChange={(value) => useRuleCreationStore.getState().setMessageType(value)}
              options={[{ label: 'Из шаблона', value: 'template' }]}
            />
          </div>
          <div>
            <Label>Выберите шаблон</Label>
            <Select
              placeholder="Выберите готовое сообщение"
              value={template}
              onChange={(value) => useRuleCreationStore.getState().setTemplate(value)}
              options={[{ label: 'Welcome template', value: 'welcome' }]}
            />
          </div>
        </div>
      </section>

      <section className="pt-8 border-t border-gray-200 space-y-6">
        <header className="flex items-center gap-2 text-lg font-medium text-gray-800">
          <Shield className="w-5 h-5 text-blue-500" />
          <span>Дополнительные Настройки</span>
        </header>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-sm flex items-start gap-4">
          <Shield className="w-6 h-6 text-blue-500 flex-shrink-0" />
          <div>
            <div className="font-medium text-blue-700">
              Интеграция с Keitaro
            </div>
            <p className="mt-1 text-blue-900">
              Система автоматически учитывает объём основного трафика из Keitaro
              и догружает лидов в соответствии с установленными лимитами.
            </p>
          </div>
        </div>
      </section>

      <footer className="flex justify-end gap-4 pt-8 border-t border-gray-200">
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={handleSubmit}
          disabled={createRuleMutation.isPending}
        >
          {createRuleMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Создание...
            </>
          ) : (
            'Создать Правило'
          )}
        </Button>
        <Button variant="outline">Тест Правила</Button>
      </footer>

      <AllRulesView />
    </Card>
  );
};

export default RuleCreationForm;
