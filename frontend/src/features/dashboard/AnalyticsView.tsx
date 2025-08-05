'use client';

import { useState } from 'react';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Target,
  Loader2,
} from 'lucide-react';
import { useAnalyticsOverview } from '@/features/dashboard/model/hooks';

export default function AnalyticsView() {
  const { data: analyticsData, isLoading, error } = useAnalyticsOverview();
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());

  const toggleLeads = (id: string) => {
    setExpandedRules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Загрузка аналитики...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Ошибка при загрузке аналитики</p>
        <p className="text-sm text-gray-500">
          {error instanceof Error ? error.message : 'Неизвестная ошибка'}
        </p>
      </div>
    );
  }

  if (!analyticsData || analyticsData.rules.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Нет данных для аналитики</p>
        <p className="text-sm text-gray-500">
          Создайте правила для отображения статистики
        </p>
      </div>
    );
  }

  const { totalStats, rules } = analyticsData;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Аналитика Редиректов</h2>
        <p className="text-sm text-muted-foreground">
          Статистика отправки лидов и производительность правил
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 flex justify-between items-center">
            <div>
              <div className="text-sm text-muted-foreground">
                Всего отправлено
              </div>
              <div className="text-2xl font-semibold">
                {totalStats.totalSent}
              </div>
              <div className="text-sm text-green-600 mt-1">
                {totalStats.totalSuccess} успешных
              </div>
            </div>
            <ChevronDown className="w-8 h-8 text-blue-500 rotate-90" />
          </Card>
          <Card className="p-4 flex justify-between items-center">
            <div>
              <div className="text-sm text-muted-foreground">Успешно</div>
              <div className="text-2xl font-semibold">
                {totalStats.totalSuccess}
              </div>
              <div className="text-sm text-green-600 mt-1">
                {totalStats.successRate} успешных
              </div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </Card>
          <Card className="p-4 flex justify-between items-center">
            <div>
              <div className="text-sm text-muted-foreground">Ошибки</div>
              <div className="text-2xl font-semibold">
                {totalStats.totalErrors}
              </div>
              <div className="text-sm text-red-600 mt-1">
                неуспешных отправок
              </div>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </Card>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Производительность Правил</h2>
        <p className="text-sm text-muted-foreground">
          Детальная статистика по каждому правилу редиректа
        </p>

        <div className="space-y-6">
          {rules.map((ruleAnalytics) => {
            const { rule, stats, recentSendings } = ruleAnalytics;
            const successRateNum = parseFloat(
              stats.successRate.replace('%', '')
            );
            const isExpanded = expandedRules.has(rule.id);

            return (
              <Card key={rule.id} className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-yellow-500'}`}
                    />
                    <div className="text-sm font-medium">
                      {rule.name}
                      <div className="text-xs text-muted-foreground">
                        {`Оффер: ${rule.offerName}`}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {stats.successRate} успешных
                    </Badge>
                    <Badge variant="outline">Звонок</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    Последняя отправка: {stats.lastSent}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm text-center">
                  <div>
                    <div className="text-blue-600 font-semibold">
                      {stats.totalSent}
                    </div>
                    Отправлено
                  </div>
                  <div>
                    <div className="text-green-600 font-semibold">
                      {stats.totalSuccess}
                    </div>
                    Успешно
                  </div>
                  <div>
                    <div className="text-red-600 font-semibold">
                      {stats.totalErrors}
                    </div>
                    Ошибки
                  </div>
                </div>

                <div className="mt-2 text-sm text-muted-foreground">
                  Процент успешных отправок
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black"
                      style={{ width: `${successRateNum}%` }}
                    />
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {stats.successRate}
                  </div>
                </div>

                <div
                  className="mt-4 flex justify-between items-center cursor-pointer text-sm text-muted-foreground"
                  onClick={() => toggleLeads(rule.id)}
                >
                  <span>Показать лиды ({recentSendings.length})</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-4">
                    {recentSendings.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        Нет данных об отправках
                      </div>
                    ) : (
                      recentSendings.map((sending) => (
                        <div
                          key={sending.id}
                          className="rounded-md border p-4 bg-muted/40 flex justify-between"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                              {sending.leadName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                {sending.leadName}
                              </div>
                              {sending.email && (
                                <div className="text-xs text-muted-foreground">
                                  {sending.email}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                {sending.phone}
                              </div>
                              <div className="mt-2 text-sm">
                                Статус отправки:
                                <div className="mt-1 flex items-center gap-3">
                                  {sending.status === 'success' ? (
                                    <span className="flex items-center gap-1 text-green-600">
                                      <CheckCircle className="w-4 h-4" /> Успех
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-red-600">
                                      <XCircle className="w-4 h-4" /> Ошибка
                                    </span>
                                  )}
                                </div>
                                {sending.errorDetails && (
                                  <div className="mt-1 text-xs text-red-600">
                                    {sending.errorDetails}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right text-sm text-muted-foreground">
                            <div className="font-semibold">
                              {new Date(sending.sentAt).toLocaleString('ru-RU')}
                            </div>
                            <div className="text-xs">{sending.subid}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Динамика отправок</h2>
        <p className="text-sm text-muted-foreground">
          График отправки лидов за последние 24 часа
        </p>
        <div className="mt-6 h-64 flex flex-col items-center justify-center">
          <Target className="w-12 h-12 text-muted-foreground" />
          <div className="mt-4 text-sm font-medium text-foreground">
            График в разработке
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Интерактивный график отправки лидов по времени
          </div>
        </div>
      </Card>
    </div>
  );
}
