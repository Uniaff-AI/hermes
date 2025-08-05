'use client';

import { FC, useState } from 'react';
import { Settings, Filter, Loader2, Trash2 } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { useRules } from '@/features/rules/model/hooks';
import { Rule } from '@/features/rules/model/schemas';
import RuleEditModal from './RuleEditModal';

const formatFrequency = (minInterval: number, maxInterval: number) => {
  return `${minInterval}–${maxInterval} минут`;
};

const formatPeriod = (periodMinutes: number) => {
  if (periodMinutes >= 1440) {
    const days = Math.floor(periodMinutes / 1440);
    return `${days} ${days === 1 ? 'день' : 'дней'}`;
  }
  if (periodMinutes >= 60) {
    const hours = Math.floor(periodMinutes / 60);
    return `${hours} ${hours === 1 ? 'час' : 'часов'}`;
  }
  return `${periodMinutes} минут`;
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

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-x-8 gap-y-4 text-sm text-gray-600">
              <div>
                <div className="uppercase text-xs mb-1">Оффер</div>
                <div className="font-medium text-gray-900">
                  {rule.offerName}
                </div>
              </div>
              <div>
                <div className="uppercase text-xs mb-1">ID Оффера</div>
                <div className="font-medium text-gray-900 font-mono text-xs">
                  {rule.offerId.slice(0, 8)}...
                </div>
              </div>
              <div>
                <div className="uppercase text-xs mb-1">Период</div>
                <div className="font-medium text-gray-900">
                  {formatPeriod(rule.periodMinutes)}
                </div>
              </div>
              <div>
                <div className="uppercase text-xs mb-1">Частота</div>
                <div className="font-medium text-gray-900">
                  {formatFrequency(rule.minInterval, rule.maxInterval)}
                </div>
              </div>
              <div>
                <div className="uppercase text-xs mb-1">Лимит в день</div>
                <div className="inline-block bg-gray-100 px-3 py-1 rounded-full font-semibold text-gray-900">
                  {rule.dailyLimit} лидов
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center text-xs text-gray-500">
              <span className="mr-1">🕒</span>
              <span>Время отправки:</span>
              <span className="ml-2 font-medium text-gray-900">
                {rule.sendWindowStart}–{rule.sendWindowEnd}
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
