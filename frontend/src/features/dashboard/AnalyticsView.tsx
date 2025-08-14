'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  Monitor,
  AlertCircle,
  Info,
  Settings,
  Activity,
  Database,
} from 'lucide-react';
import { useAnalyticsOverview } from '@/features/dashboard/model/hooks';
import { useRuleDebugLogs } from '@/features/rules/model/hooks';

export default function AnalyticsView() {
  const { data: analyticsData, isLoading, error } = useAnalyticsOverview();
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());
  const [monitoringRules, setMonitoringRules] = useState<Set<string>>(new Set());

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

  const toggleMonitoring = (id: string) => {
    setMonitoringRules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const RuleMonitoringPanel = ({ ruleId }: { ruleId: string }) => {
    const { data: debugData, isLoading: logsLoading, error: logsError } = useRuleDebugLogs(ruleId, true);

    if (logsLoading) {
      return (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Загрузка логов...</span>
        </div>
      );
    }

    if (logsError) {
      return (
        <div className="flex flex-col items-center justify-center h-32 text-red-500 space-y-2">
          <AlertCircle className="w-6 h-6" />
          <span className="text-sm font-medium">Ошибка загрузки логов</span>
          <span className="text-xs text-gray-500">
            {logsError instanceof Error ? logsError.message : 'Неизвестная ошибка'}
          </span>
        </div>
      );
    }

    if (!debugData) {
      return (
        <div className="flex flex-col items-center justify-center h-32 text-gray-500 space-y-2">
          <Info className="w-6 h-6" />
          <span className="text-sm font-medium">Нет данных</span>
          <span className="text-xs">Не удалось получить информацию о правиле</span>
        </div>
      );
    }

    const hasActivity = debugData?.recentActivity && debugData.recentActivity.length > 0;
    const stats = debugData?.stats || { totalAttempts: 0, successful: 0, failed: 0 };
    const ruleConfig = debugData?.ruleConfig;
    const diagnostics = debugData?.diagnostics;

    const analyzeRuleProblems = () => {
      const problems = [];

      if (!ruleConfig) {
        problems.push('Конфигурация правила недоступна');
        return problems;
      }

      if (diagnostics?.validationIssues) {
        problems.push(...diagnostics.validationIssues);
      } else {
        if (!ruleConfig.isActive) {
          problems.push('Правило неактивно');
        }

        if (!ruleConfig.targetProductName) {
          problems.push('Не выбран целевой продукт');
        }

        const hasLeadFilters = ruleConfig.leadStatus || ruleConfig.targetProductCountry || ruleConfig.targetProductVertical;
        if (!hasLeadFilters) {
          problems.push('Рекомендуется указать фильтры лидов (статус, страна или вертикаль)');
        }
      }

      return problems;
    };

    const problems = analyzeRuleProblems();

    return (
      <div className="h-full flex flex-col space-y-4 overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <h3 className="text-lg font-semibold">Мониторинг правила</h3>
          <div className="flex items-center gap-2">
            <Badge variant={hasActivity ? "default" : "secondary"}>
              {hasActivity ? "Активно" : "Нет активности"}
            </Badge>
          </div>
        </div>

        {/* Основной контент с скроллом */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Конфигурация правила */}
          {ruleConfig && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Конфигурация правила
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Статус:</span>
                    <span className={`font-medium ${ruleConfig.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {ruleConfig.isActive ? 'Активно' : 'Неактивно'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Режим:</span>
                    <span className="font-medium">{ruleConfig.isInfinite ? 'Бесконечный' : 'Ограниченный'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Продукт:</span>
                    <span className="font-medium">{ruleConfig.targetProductName || 'Не указан'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Страна:</span>
                    <span className="font-medium">{ruleConfig.targetProductCountry || 'Любая'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Вертикаль:</span>
                    <span className="font-medium">{ruleConfig.targetProductVertical || 'Любая'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Статус лидов:</span>
                    <span className="font-medium">{ruleConfig.leadStatus || 'Любой'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Лимит/день:</span>
                    <span className="font-medium">{ruleConfig.dailyCapLimit || 'Не ограничен'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Окно отправки:</span>
                    <span className="font-medium">
                      {ruleConfig.sendWindow ? (
                        (() => {
                          const [start, end] = ruleConfig.sendWindow.split('-');
                          const startTime = start.split(':').map(Number);
                          const endTime = end.split(':').map(Number);
                          const startMinutes = startTime[0] * 60 + startTime[1];
                          const endMinutes = endTime[0] * 60 + endTime[1];

                          if (startMinutes > endMinutes) {
                            return `${start}-${end} (через полночь)`;
                          } else {
                            return ruleConfig.sendWindow;
                          }
                        })()
                      ) : 'Всегда'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Интервалы:</span>
                  <span className="font-medium">{ruleConfig.intervals || 'Не указаны'}</span>
                </div>
                {(ruleConfig.leadDateFrom || ruleConfig.leadDateTo) && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-600">Диапазон дат:</span>
                    <span className="font-medium">
                      {ruleConfig.leadDateFrom || 'Не ограничено'} - {ruleConfig.leadDateTo || 'Не ограничено'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Диагностика проблем */}
          {problems.length > 0 && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h4 className="font-medium text-sm text-red-800 flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4" />
                Обнаружены проблемы
              </h4>
              <ul className="space-y-1">
                {problems.map((problem, index) => (
                  <li key={index} className="text-sm text-red-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {problem}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Анализ доступности лидов */}
          {diagnostics?.leadAnalysis && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h4 className="font-medium text-sm text-green-800 flex items-center gap-2 mb-3">
                <Database className="w-4 h-4" />
                Анализ доступности лидов
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Доступно лидов:</span>
                  <span className={`font-medium ${diagnostics.leadAnalysis.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {diagnostics.leadAnalysis.available}
                  </span>
                </div>

                {diagnostics.leadAnalysis.error && (
                  <div className="text-sm text-red-600 bg-red-100 p-2 rounded">
                    <strong>Ошибка API:</strong> {diagnostics.leadAnalysis.error}
                  </div>
                )}

                {diagnostics.leadAnalysis.sampleLeads && diagnostics.leadAnalysis.sampleLeads.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Примеры доступных лидов:</div>
                    <div className="space-y-1">
                      {diagnostics.leadAnalysis.sampleLeads.map((lead, index) => (
                        <div key={index} className="text-xs bg-white p-2 rounded border">
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-gray-500">{lead.phone} • {lead.country} • {lead.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Рекомендации */}
          {diagnostics?.recommendations && diagnostics.recommendations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-medium text-sm text-blue-800 flex items-center gap-2 mb-3">
                <Info className="w-4 h-4" />
                Рекомендации
              </h4>
              <ul className="space-y-1">
                {diagnostics.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-blue-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Статистика активности */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Статистика активности
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalAttempts}</div>
                <div className="text-xs text-gray-600">Всего попыток</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
                <div className="text-xs text-gray-600">Успешно</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-xs text-gray-600">Ошибки</div>
              </div>
            </div>
            {stats.totalAttempts > 0 && (
              <div className="pt-2 border-t border-blue-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Процент успеха:</span>
                  <span className="font-medium text-green-600">
                    {((stats.successful / stats.totalAttempts) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Лог активности */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Database className="w-4 h-4" />
                Лог активности
              </h4>
              {hasActivity && (
                <span className="text-xs text-gray-500">
                  Последняя активность: {new Date(debugData.recentActivity[0].sentAt).toLocaleString('ru-RU')}
                </span>
              )}
            </div>

            {hasActivity ? (
              <div className="space-y-2 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {debugData.recentActivity.map((activity: any, index: number) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {activity.status?.toUpperCase() === 'SUCCESS' ? (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{activity.leadName}</div>
                        <div className="text-xs text-gray-500 truncate">{activity.phone}</div>
                        {activity.email && (
                          <div className="text-xs text-gray-500 truncate">{activity.email}</div>
                        )}
                        {activity.country && (
                          <div className="text-xs text-gray-500">Страна: {activity.country}</div>
                        )}
                        {activity.errorDetails && (
                          <div className="text-xs text-red-500 mt-1 bg-red-50 p-2 rounded">
                            <strong>Ошибка:</strong> {activity.errorDetails}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className="text-xs text-gray-500">
                        {new Date(activity.sentAt).toLocaleTimeString('ru-RU')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(activity.sentAt).toLocaleDateString('ru-RU')}
                      </div>
                      {activity.responseStatus && (
                        <div className="text-xs text-gray-500 mt-1">
                          HTTP: {activity.responseStatus}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-32 text-gray-500 space-y-3 border border-gray-200 rounded-lg p-4">
                <Info className="w-8 h-8 flex-shrink-0" />
                <div className="text-center">
                  <p className="text-sm font-medium">Нет активности</p>
                  <p className="text-xs mt-1">
                    Правило не отправляло лиды.<br />
                    Возможные причины:
                  </p>
                </div>
                <div className="w-full max-w-xs">
                  <ul className="text-xs text-gray-400 space-y-1 text-left">
                    <li className="flex items-start gap-1">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>Нет подходящих лидов в системе</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>Правило неактивно</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>Неправильная конфигурация</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>Проблемы с внешним API</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>Вне временного окна отправки</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Загрузка аналитики...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-8 h-8 mr-2" />
        <span>Ошибка загрузки данных</span>
      </div>
    );
  }

  if (!analyticsData?.rules?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <Info className="w-8 h-8 mr-2" />
        <span>Нет правил для отображения</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Общая статистика */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Общая статистика</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {analyticsData.totalStats.totalSent}
            </div>
            <div className="text-sm text-gray-600">Всего отправлено</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {analyticsData.totalStats.totalSuccess}
            </div>
            <div className="text-sm text-gray-600">Успешно</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {analyticsData.totalStats.totalErrors}
            </div>
            <div className="text-sm text-gray-600">Ошибки</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {analyticsData.totalStats.successRate}
            </div>
            <div className="text-sm text-gray-600">Процент успеха</div>
          </div>
        </div>
      </Card>

      {/* Правила */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Правила</h2>
        {analyticsData.rules.map((ruleData) => {
          const isExpanded = expandedRules.has(ruleData.rule.id);
          const isMonitoring = monitoringRules.has(ruleData.rule.id);
          const hasLeads = ruleData.recentSendings.length > 0;

          return (
            <Card key={ruleData.rule.id} className="p-6 overflow-hidden">
              <div className="relative">
                {/* Основная информация о правиле */}
                <motion.div
                  className="space-y-4"
                  animate={{
                    marginRight: isMonitoring ? 600 : 0
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    duration: 0.4
                  }}
                >
                  <div className="flex items-center justify-between mr-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${ruleData.rule.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <h3 className="font-semibold">{ruleData.rule.name}</h3>
                        <p className="text-sm text-gray-600">Продукт: {ruleData.rule.productName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={ruleData.stats.successRate === '100.0%' ? 'default' : 'secondary'}>
                        {ruleData.stats.successRate} успешных
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleMonitoring(ruleData.rule.id)}
                      >
                        <Monitor className="w-4 h-4 mr-1" />
                        {isMonitoring ? 'Скрыть логи' : 'Мониторинг'}
                      </Button>
                    </div>
                  </div>

                  {/* Статистика отправок */}
                  <div className="grid grid-cols-3 gap-4 text-center mr-2">
                    <div>
                      <div className="text-blue-600 font-semibold">
                        {ruleData.stats.totalSent}
                      </div>
                      <div className="text-xs text-gray-500">Отправлено</div>
                    </div>
                    <div>
                      <div className="text-green-600 font-semibold">
                        {ruleData.stats.totalSuccess}
                      </div>
                      <div className="text-xs text-gray-500">Успешно</div>
                    </div>
                    <div>
                      <div className="text-red-600 font-semibold">
                        {ruleData.stats.totalErrors}
                      </div>
                      <div className="text-xs text-gray-500">Ошибки</div>
                    </div>
                  </div>

                  {/* Прогресс бар */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-0">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${ruleData.stats.totalSent > 0 ? (ruleData.stats.totalSuccess / ruleData.stats.totalSent) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-green-600 min-w-[3rem] text-right flex-shrink-0 mr-2">
                        {ruleData.stats.totalSent > 0
                          ? `${((ruleData.stats.totalSuccess / ruleData.stats.totalSent) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Процент успешных отправок</p>
                  </div>

                  {/* Кнопка показа лидов */}
                  {hasLeads && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLeads(ruleData.rule.id)}
                      className="p-0 h-auto"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 mr-1" />
                      ) : (
                        <ChevronRight className="w-4 h-4 mr-1" />
                      )}
                      Показать лиды ({ruleData.recentSendings.length})
                    </Button>
                  )}

                  {/* Список лидов */}
                  <AnimatePresence>
                    {isExpanded && hasLeads && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        {ruleData.recentSendings.map((sending) => (
                          <motion.div
                            key={sending.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              {sending.status?.toUpperCase() === 'SUCCESS' ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                              <div>
                                <div className="font-medium text-sm">{sending.leadName}</div>
                                <div className="text-xs text-gray-500">{sending.phone}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">
                                {new Date(sending.sentAt).toLocaleString('ru-RU')}
                              </div>
                              {sending.errorDetails && (
                                <div className="text-xs text-red-500">{sending.errorDetails}</div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Панель мониторинга - абсолютное позиционирование */}
                <AnimatePresence>
                  {isMonitoring && (
                    <motion.div
                      initial={{ x: "100%", opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: "100%", opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        duration: 0.4
                      }}
                      className="absolute top-0 right-0 w-[600px] h-full border-l border-gray-200 pl-4 bg-white overflow-hidden"
                    >
                      <RuleMonitoringPanel ruleId={ruleData.rule.id} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
