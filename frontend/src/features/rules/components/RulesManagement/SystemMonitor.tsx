'use client';

import { FC, useState } from 'react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import {
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  Database,
  Globe,
  Settings,
  Info,
  XCircle
} from 'lucide-react';
import { useTestConnection, useTriggerRule, useTestRule } from '@/features/rules/model/hooks';
import { toast } from 'sonner';

interface SystemMonitorProps {
  className?: string;
  ruleId?: string;
  ruleName?: string;
}

const SystemMonitor: FC<SystemMonitorProps> = ({ className = '', ruleId, ruleName }) => {
  const { data: connectionData, isLoading, error, refetch } = useTestConnection();
  const [isManualTesting, setIsManualTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const triggerRuleMutation = useTriggerRule();
  const testRuleMutation = useTestRule();

  const handleTestConnection = async () => {
    setIsManualTesting(true);
    try {
      await refetch();
      toast.success('Проверка соединения завершена');
    } catch (error) {
      toast.error('Ошибка при проверке соединения');
    } finally {
      setIsManualTesting(false);
    }
  };

  const runRuleDiagnostics = async () => {
    if (!ruleId) return;

    setIsManualTesting(true);
    setTestResults(null);

    try {
      const results = {
        timestamp: new Date().toISOString(),
        tests: {} as any
      };

      try {
        const ruleTestResult = await testRuleMutation.mutateAsync(ruleId);
        results.tests.rule = {
          success: true,
          data: ruleTestResult,
          message: 'Тест правила выполнен успешно'
        };
      } catch (error) {
        results.tests.rule = {
          success: false,
          error: error instanceof Error ? error.message : 'Неизвестная ошибка',
          message: 'Ошибка тестирования правила'
        };
      }

      setTestResults(results);
      toast.success('Диагностика правила завершена');
    } catch (error) {
      toast.error('Ошибка при выполнении диагностики');
    } finally {
      setIsManualTesting(false);
    }
  };

  const triggerRule = async () => {
    if (!ruleId) return;

    try {
      await triggerRuleMutation.mutateAsync(ruleId);
      toast.success('Правило запущено вручную');
    } catch (error) {
      toast.error('Ошибка при запуске правила');
    }
  };

  const renderEndpointStatus = (endpoint: any, name: string, icon: React.ReactNode) => {
    if (!endpoint) {
      return (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium">{name}</span>
          </div>
          <Badge variant="outline">Не проверено</Badge>
        </div>
      );
    }

    const isSuccess = endpoint.success;
    const statusColor = isSuccess ? 'text-green-600' : 'text-red-600';
    const bgColor = isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';

    return (
      <div className={`flex items-center justify-between p-3 border rounded-lg ${bgColor}`}>
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-gray-500">{endpoint.url}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            {isSuccess ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <Badge
              variant="outline"
              className={`${statusColor} ${isSuccess ? 'border-green-300' : 'border-red-300'}`}
            >
              {endpoint.status}
            </Badge>
          </div>
          {endpoint.count !== undefined && (
            <div className="text-xs text-gray-600 mt-1">
              {endpoint.count} записей
            </div>
          )}
          {endpoint.error && (
            <div className="text-xs text-red-600 mt-1 max-w-32 truncate" title={endpoint.error}>
              {endpoint.error}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Мониторинг Системы</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={isLoading || isManualTesting}
            size="sm"
          >
            {(isLoading || isManualTesting) ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Проверить API
          </Button>
          {ruleId && (
            <Button
              variant="outline"
              onClick={runRuleDiagnostics}
              disabled={isManualTesting}
              size="sm"
            >
              {isManualTesting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Settings className="w-4 h-4 mr-2" />
              )}
              Диагностика правила
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Внешние API */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Внешние API</h4>
          <div className="space-y-2">
            {connectionData?.endpoints ? (
              <>
                {renderEndpointStatus(
                  connectionData.endpoints.products,
                  'Products API',
                  <Database className="w-4 h-4 text-blue-500" />
                )}
                {renderEndpointStatus(
                  connectionData.endpoints.leads,
                  'Leads API',
                  <Globe className="w-4 h-4 text-green-500" />
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Wifi className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Нажмите "Проверить API" для диагностики</p>
              </div>
            )}
          </div>
        </div>

        {/* Действия с правилом */}
        {ruleId && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Действия с правилом</h4>
            <div className="flex gap-2">
              <Button
                onClick={triggerRule}
                disabled={triggerRuleMutation.isPending}
                size="sm"
                variant="outline"
              >
                {triggerRuleMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Activity className="w-4 h-4 mr-2" />
                )}
                Запустить правило
              </Button>
            </div>
          </div>
        )}

        {/* Результаты диагностики правила */}
        {testResults && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Результаты диагностики</h4>
            <div className="space-y-3">
              {testResults.tests.rule && (
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    {testResults.tests.rule.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">Тест правила</span>
                    <Badge variant="outline" className="text-xs">
                      {new Date(testResults.timestamp).toLocaleTimeString()}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">
                    {testResults.tests.rule.message}
                  </p>
                  {testResults.tests.rule.error && (
                    <p className="text-xs text-red-500 mt-1">
                      Ошибка: {testResults.tests.rule.error}
                    </p>
                  )}
                  {testResults.tests.rule.data && (
                    <div className="mt-2 text-xs">
                      <details>
                        <summary className="cursor-pointer text-blue-600">Детали теста</summary>
                        <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-32">
                          {JSON.stringify(testResults.tests.rule.data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Рекомендации */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Рекомендации</span>
          </div>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Если правило не работает, проверьте его конфигурацию</li>
            <li>• Убедитесь, что есть подходящие лиды в системе</li>
            <li>• Проверьте статус внешнего API</li>
            <li>• Используйте ручной запуск для тестирования</li>
            <li>• Проверьте логи мониторинга в карточке правила</li>
          </ul>
        </div>

        {connectionData?.timestamp && (
          <div className="pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Последняя проверка: {new Date(connectionData.timestamp).toLocaleString('ru-RU')}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <WifiOff className="w-4 h-4" />
              <span className="font-medium">Ошибка соединения</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              {error instanceof Error ? error.message : 'Неизвестная ошибка'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SystemMonitor; 