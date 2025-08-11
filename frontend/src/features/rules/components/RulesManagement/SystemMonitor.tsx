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
  Globe
} from 'lucide-react';
import { useTestConnection } from '@/features/rules/model/hooks';

interface SystemMonitorProps {
  className?: string;
}

const SystemMonitor: FC<SystemMonitorProps> = ({ className = '' }) => {
  const { data: connectionData, isLoading, error, refetch } = useTestConnection();
  const [isManualTesting, setIsManualTesting] = useState(false);

  const handleTestConnection = async () => {
    setIsManualTesting(true);
    try {
      await refetch();
    } finally {
      setIsManualTesting(false);
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
            <div className="text-xs text-red-600 mt-1 max-w-32 truncate">
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
        <Button
          variant="outline"
          onClick={handleTestConnection}
          disabled={isLoading || isManualTesting}
          className="flex items-center gap-2"
        >
          {(isLoading || isManualTesting) ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Проверить соединение
        </Button>
      </div>

      <div className="space-y-4">
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
                <p>Нажмите "Проверить соединение" для диагностики</p>
              </div>
            )}
          </div>
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