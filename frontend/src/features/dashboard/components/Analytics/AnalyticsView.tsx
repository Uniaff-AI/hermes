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
} from 'lucide-react';
import { useAnalyticsOverview } from '@/features/dashboard/model/hooks';
import Monitoring from './Monitoring';

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

                {/* Компонент мониторинга */}
                <Monitoring
                  ruleId={ruleData.rule.id}
                  isVisible={isMonitoring}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
