'use client';

import { FC, useState } from 'react';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Edit2, Copy, Trash2, Shield, Clock, Loader2, Infinity } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useRules, useDeleteRule } from '@/features/rules/model/hooks';
import { Rule } from '@/features/rules/model/schemas';
import RuleEditModal from './RuleEditModal';
import RuleDeleteDialog from './RuleDeleteDialog';
import { StatusTranslations } from '@/shared/utilities/enums';

const formatFrequency = (minIntervalMinutes: number, maxIntervalMinutes: number) => {
  return `${minIntervalMinutes}–${maxIntervalMinutes} минут`;
};

const AllRulesView: FC = () => {
  const { data: rules = [], isLoading, error } = useRules();
  const deleteRuleMutation = useDeleteRule();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<Rule | null>(null);

  const handleDeleteRule = async (rule: Rule) => {
    setRuleToDelete(rule);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!ruleToDelete) return;

    try {
      await deleteRuleMutation.mutateAsync(ruleToDelete.id);
    } catch (error) {
      console.error('Ошибка при удалении правила:', error);
    } finally {
      setIsDeleteDialogOpen(false);
      setRuleToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setRuleToDelete(null);
  };

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
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Загрузка правил...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Ошибка при загрузке правил</p>
        <p className="text-sm text-gray-500">
          {error instanceof Error ? error.message : 'Неизвестная ошибка'}
        </p>
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Правила не найдены</p>
        <p className="text-sm text-gray-500">
          Создайте первое правило для начала работы
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-gray-900">Все Правила</h2>
        <p className="text-sm text-muted-foreground">
          Полный список созданных правил перенаправления
        </p>
      </div>
      <div className="space-y-4">
        {rules.map((rule: Rule) => (
          <Card
            key={rule.id}
            className="p-6 relative bg-white rounded-2xl border"
          >
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Button
                variant="outline"
                className="p-2 hover:bg-gray-100 rounded"
                onClick={() => handleEditRule(rule)}
              >
                <Edit2 className="w-4 h-4 text-gray-500" />
              </Button>
              <Button
                variant="outline"
                className="p-2 hover:bg-gray-100 rounded"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </Button>
              <Button
                variant="outline"
                className="p-2 hover:bg-gray-100 rounded"
                onClick={() => handleDeleteRule(rule)}
                disabled={deleteRuleMutation.isPending}
              >
                {deleteRuleMutation.isPending ? (
                  <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 text-red-500" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`w-3 h-3 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
              />
              <h3 className="text-base font-medium text-gray-900">
                {rule.name}
              </h3>
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                {rule.isActive ? 'Активно' : 'Пауза'}
              </Badge>
              {rule.isInfinite && (
                <Badge variant="outline" className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                  <Infinity className="w-3 h-3 mr-1" />
                  Бесконечно
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-sm text-gray-600">
              <div>
                <div className="uppercase text-xs mb-1">Продукт</div>
                <div className="font-medium text-gray-900">
                  {rule.targetProductName}
                </div>
              </div>
              <div>
                <div className="uppercase text-xs mb-1">ID Продукта</div>
                <div className="font-medium text-gray-900 font-mono text-xs">
                  {rule.targetProductId.slice(0, 8)}...
                </div>
              </div>
              <div>
                <div className="uppercase text-xs mb-1">Интервал</div>
                <div className="font-medium text-gray-900">
                  {formatFrequency(rule.minIntervalMinutes, rule.maxIntervalMinutes)}
                </div>
              </div>
              <div>
                <div className="uppercase text-xs mb-1">Лимит/день</div>
                <div className="font-medium text-gray-900">
                  {rule.dailyCapLimit} лидов
                </div>
              </div>
            </div>

            {/* Секция 2: Фильтры лидов */}
            {(rule.leadVertical || rule.leadCountry || rule.leadStatus) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
                {rule.leadVertical && (
                  <div>
                    <div className="uppercase text-xs mb-1">Вертикаль лидов</div>
                    <div className="font-medium text-gray-900">
                      {rule.leadVertical}
                    </div>
                  </div>
                )}
                {rule.leadCountry && (
                  <div>
                    <div className="uppercase text-xs mb-1">Страна лидов</div>
                    <div className="font-medium text-gray-900">
                      {rule.leadCountry}
                    </div>
                  </div>
                )}
                {rule.leadStatus && (
                  <div>
                    <div className="uppercase text-xs mb-1">Статус лида</div>
                    <div className="font-medium text-gray-900">
                      {StatusTranslations[rule.leadStatus] || rule.leadStatus}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Секция 3: Целевой продукт */}
            {(rule.targetProductVertical || rule.targetProductCountry || rule.targetProductAffiliate) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
                {rule.targetProductVertical && (
                  <div>
                    <div className="uppercase text-xs mb-1">Вертикаль продукта</div>
                    <div className="font-medium text-gray-900">
                      {rule.targetProductVertical}
                    </div>
                  </div>
                )}
                {rule.targetProductCountry && (
                  <div>
                    <div className="uppercase text-xs mb-1">Страна продукта</div>
                    <div className="font-medium text-gray-900">
                      {rule.targetProductCountry}
                    </div>
                  </div>
                )}
                {rule.targetProductAffiliate && (
                  <div>
                    <div className="uppercase text-xs mb-1">ПП продукта</div>
                    <div className="font-medium text-gray-900">
                      {rule.targetProductAffiliate}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <span>Лимит в день:</span>
                {rule.isInfinite ? (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                    <Infinity className="w-3 h-3 mr-1" />
                    Бесконечно
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {rule.dailyCapLimit} лидов
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Время отправки:</span>
                <span className="inline-block bg-gray-100 text-xs px-2 py-0.5 rounded">
                  {rule.sendWindowStart}–{rule.sendWindowEnd}
                </span>
              </div>
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

      {/* Диалог удаления */}
      <RuleDeleteDialog
        ruleName={ruleToDelete?.name || ''}
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        isLoading={deleteRuleMutation.isPending}
      />
    </div>
  );
};

export default AllRulesView;
