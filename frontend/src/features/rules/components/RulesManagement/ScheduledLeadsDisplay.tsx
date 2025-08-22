'use client';

import { FC } from 'react';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Clock, Calendar, Target } from 'lucide-react';
import {
  convertUTCToLocalDateTime,
  convertUTCToLocalTime,
  getMinutesUntilSchedule,
  getTimezoneInfo
} from '@/shared/utilities/timezone';

interface ScheduledLead {
  leadSubid: string;
  scheduleTime: string;
  delayMinutes: number;
  isPending: boolean;
}

interface ScheduledLeadsData {
  ruleId: string;
  totalScheduled: number;
  pendingCount: number;
  nextScheduleTime: string;
  timeouts: ScheduledLead[];
}

interface ScheduledLeadsDisplayProps {
  scheduledLeads?: ScheduledLeadsData;
  className?: string;
}

const ScheduledLeadsDisplay: FC<ScheduledLeadsDisplayProps> = ({
  scheduledLeads,
  className = ''
}) => {
  const timezoneInfo = getTimezoneInfo();

  if (!scheduledLeads || scheduledLeads.totalScheduled === 0) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Нет запланированных лидов</span>
        </div>
      </Card>
    );
  }

  const nextScheduleMinutes = getMinutesUntilSchedule(scheduledLeads.nextScheduleTime);
  const nextScheduleLocal = convertUTCToLocalDateTime(scheduledLeads.nextScheduleTime);

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Запланированные лиды</span>
          </div>
          <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
            {scheduledLeads.pendingCount} из {scheduledLeads.totalScheduled}
          </Badge>
        </div>

        {/* Next scheduled lead */}
        {scheduledLeads.nextScheduleTime && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Следующий лид</span>
            </div>
            <div className="text-sm text-blue-700">
              <div>{nextScheduleLocal}</div>
              <div className="text-xs text-blue-600 mt-1">
                {nextScheduleMinutes === 0
                  ? 'Отправляется сейчас...'
                  : `через ${nextScheduleMinutes} минут`
                }
              </div>
            </div>
          </div>
        )}

        {/* Timezone info */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>Время отображается в {timezoneInfo.displayName} ({timezoneInfo.offsetString})</span>
        </div>

        {/* List of scheduled leads */}
        {scheduledLeads.timeouts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Расписание отправки:</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {scheduledLeads.timeouts.slice(0, 15).map((lead, index) => {
                const localTime = convertUTCToLocalTime(lead.scheduleTime);
                const minutesUntil = getMinutesUntilSchedule(lead.scheduleTime);

                return (
                  <div
                    key={`${lead.leadSubid}-${index}`}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-600">
                        {lead.leadSubid.slice(-8)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{localTime}</div>
                      <div className="text-gray-500">
                        {minutesUntil === 0
                          ? 'сейчас'
                          : `+${minutesUntil}м`
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
              {scheduledLeads.timeouts.length > 15 && (
                <div className="text-xs text-gray-500 text-center py-1">
                  ... и еще {scheduledLeads.timeouts.length - 15} лидов
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ScheduledLeadsDisplay;
