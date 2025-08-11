'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar } from './calendar';
import { Input } from './input';
import { Label } from './label';

interface DateTimePickerProps {
  label: string;
  date?: Date | null;
  time?: string;
  onDateChange: (date: Date | null) => void;
  onTimeChange: (time: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const DateTimePicker = ({
  label,
  date,
  time = '09:00',
  onDateChange,
  onTimeChange,
  disabled = false,
  placeholder = 'Выберите дату',
}: DateTimePickerProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return placeholder;
    return format(date, 'dd.MM.yyyy', { locale: ru });
  };

  return (
    <div className="space-y-2">
      <Label className={disabled ? 'text-gray-400' : ''}>{label}</Label>
      <div className="flex gap-3">
        {/* Date picker */}
        <div className="relative flex-1">
          <div
            className={`w-full border border-gray-300 px-3 py-2 rounded-md bg-white text-sm text-gray-700 cursor-pointer hover:border-gray-400 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 flex items-center justify-between transition-colors ${disabled ? 'cursor-not-allowed bg-gray-50 text-gray-400 hover:border-gray-300' : ''
              }`}
            onClick={() => !disabled && setIsCalendarOpen(true)}
          >
            <span className={!date ? 'text-gray-400' : ''}>
              {formatDate(date || null)}
            </span>
            <CalendarIcon className="w-4 h-4 text-gray-400" />
          </div>

          {isCalendarOpen && !disabled && (
            <div className="absolute top-full left-0 z-50 mt-1">
              <Calendar
                selected={date || null}
                onChange={(newDate) => {
                  onDateChange(newDate);
                  setIsCalendarOpen(false);
                }}
                onClose={() => setIsCalendarOpen(false)}
              />
            </div>
          )}
        </div>

        {/* Time picker */}
        <div className="relative w-40">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <Input
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            disabled={disabled}
            className={`pl-10 w-full ${disabled ? 'bg-gray-50 text-gray-400' : ''}`}
          />
        </div>
      </div>

      {disabled && (
        <p className="text-xs text-gray-500">
          При бесконечной отправке временные ограничения отключены
        </p>
      )}
    </div>
  );
}; 