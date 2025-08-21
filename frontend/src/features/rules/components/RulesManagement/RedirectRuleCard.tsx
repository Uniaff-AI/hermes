'use client';

import { FC, useState } from 'react';
import { Settings, Filter, Loader2, Trash2, Infinity } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { useRules } from '@/features/rules/model/hooks';
import { Rule } from '@/features/rules/model/schemas';
import RuleEditModal from './RuleEditModal';
import { StatusTranslations } from '@/shared/utilities/enums';
import { formatTimeWindow } from '@/shared/utilities/timezone';

const formatFrequency = (minIntervalMinutes: number, maxIntervalMinutes: number) => {
  return `${minIntervalMinutes}–${maxIntervalMinutes} минут`;
};

const RedirectRulesView: FC = () => {
  const { data: rules = [], isLoading, error } = useRules();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);

  const handleEditRule = (rule: Rule) => {
    setSelectedRule(rule);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedRule(null);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Загрузка правил
          </h3>
          <p className="text-sm text-gray-500">
            Получаем список ваших правил перенаправления...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Filter className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ошибка при загрузке правил
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Не удалось загрузить список правил. Попробуйте обновить страницу.
          </p>
          {error instanceof Error && (
            <p className="text-xs text-red-500 mb-4 bg-red-50 p-2 rounded">
              {error.message}
            </p>
          )}
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="text-sm"
          >
            Обновить страницу
          </Button>
        </div>
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Правила не найдены
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            У вас пока нет созданных правил перенаправления. Создайте первое
            правило для начала работы с системой.
          </p>
          <div className="space-y-3">
            <p className="text-xs text-gray-400">
              Перейдите в раздел "Менеджмент правил" для создания нового правил
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {rules.map((rule) => (
          <Card
            key={rule.id}
            className="bg-white rounded-2xl border p-6 shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span
                  className={`w-3 h-3 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-yellow-500'}`}
                />
                <h2 className="text-lg font-semibold text-gray-900">
                  {rule.name}
                </h2>
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {rule.isActive ? 'Активно' : 'Неактивно'}
                </Badge>
                {rule.isInfinite && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                    <Infinity className="w-3 h-3 mr-1" />
                    Бесконечно
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={() => handleEditRule(rule)}
                >
                  <Settings className="w-5 h-5 text-gray-500" />
                </Button>
                <Button
                  variant="outline"
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Filter className="w-5 h-5 text-gray-500" />
                </Button>
              </div>
            </div>

            {/* Секция 3: Целевой Продукт */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-8 gap-y-4 text-sm text-gray-600 mb-4">
              <div>
                <div className="uppercase text-xs mb-1">Целевой Продукт</div>
                <div className="font-medium text-gray-900">
                  {rule.targetProductName}
                </div>
              </div>
              <div>
                <div className="uppercase text-xs mb-1">ID Продукта</div>
                <div className="font-medium text-gray-900 font-mono text-xs">
                  {rule.targetProductId?.slice(0, 8)}...
                </div>
              </div>
              <div>
                <div className="uppercase text-xs mb-1">Вертикаль</div>
                <div className="font-medium text-gray-900">
                  {rule.targetProductVertical || 'Не указана'}
                </div>
              </div>
              <div>
                <div className="uppercase text-xs mb-1">Страна</div>
                <div className="font-medium text-gray-900">
                  {rule.targetProductCountry || 'Не указана'}
                </div>
              </div>
            </div>

            {/* Секция 2: Фильтры Лидов */}
            {(rule.leadStatus || rule.leadVertical || rule.leadCountry || rule.leadAffiliate) && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-8 gap-y-4 text-sm text-gray-600 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="uppercase text-xs mb-1 text-gray-500">Статус лида</div>
                  <div className="font-medium text-gray-900">
                    {rule.leadStatus ? StatusTranslations[rule.leadStatus] || rule.leadStatus : 'Любой'}
                  </div>
                </div>
                <div>
                  <div className="uppercase text-xs mb-1 text-gray-500">Вертикаль</div>
                  <div className="font-medium text-gray-900">
                    {rule.leadVertical || 'Любая'}
                  </div>
                </div>
                <div>
                  <div className="uppercase text-xs mb-1 text-gray-500">Страна</div>
                  <div className="font-medium text-gray-900">
                    {rule.leadCountry || 'Любая'}
                  </div>
                </div>
                <div>
                  <div className="uppercase text-xs mb-1 text-gray-500">ПП</div>
                  <div className="font-medium text-gray-900">
                    {rule.leadAffiliate || 'Любой'}
                  </div>
                </div>
              </div>
            )}

            {/* Настройки отправки */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4 text-sm text-gray-600">
              <div>
                <div className="uppercase text-xs mb-1">Частота</div>
                <div className="font-medium text-gray-900">
                  {formatFrequency(rule.minIntervalMinutes, rule.maxIntervalMinutes)}
                </div>
              </div>
              <div>
                <div className="uppercase text-xs mb-1">Лимит в день</div>
                {rule.isInfinite ? (
                  <div className="inline-block bg-blue-100 px-3 py-1 rounded-full font-semibold text-blue-700">
                    <Infinity className="w-3 h-3 inline mr-1" />
                    Бесконечно
                  </div>
                ) : (
                  <div className="inline-block bg-gray-100 px-3 py-1 rounded-full font-semibold text-gray-900">
                    {rule.dailyCapLimit} лидов
                  </div>
                )}
              </div>
              <div>
                <div className="uppercase text-xs mb-1">Период</div>
                <div className="font-medium text-gray-900">
                  {rule.leadDateFrom && rule.leadDateTo
                    ? `${rule.leadDateFrom} — ${rule.leadDateTo}`
                    : 'Весь период'
                  }
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center text-xs text-gray-500">
              <span className="mr-1">🕒</span>
              <span>Время отправки:</span>
              <span className="ml-2 font-medium text-gray-900">
                {formatTimeWindow(rule.sendWindowStart, rule.sendWindowEnd)}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Модальное окно редактирования */}
      <RuleEditModal
        rule={selectedRule}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
      />
    </>
  );
};

export default RedirectRulesView;
