'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronDown, Filter, Search, X } from 'lucide-react';
import { FC, useEffect, useRef, useState } from 'react';
import { Calendar } from '@/shared/ui/calendar';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { CountryEnum, VerticalEnum, AffEnum, StatusEnum } from '@/shared/types/enums';
import { LeadsFilters } from '../../model/schemas';

type LeadsFiltersProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: LeadsFilters;
  onFiltersChange: (filters: LeadsFilters) => void;
  onClearFilters: () => void;
};

const LeadsFiltersComponent: FC<LeadsFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const [isAdvancedVisible, setAdvancedVisible] = useState(false);

  const handleFilterChange = (key: keyof LeadsFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <h2 className="text-lg font-semibold text-gray-800">Фильтры по лидам</h2>
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Очистить фильтры
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск по SubID, имени, телефону, e-mail..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.vertical && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Вертикаль: {filters.vertical}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleFilterChange('vertical', undefined)}
              />
            </Badge>
          )}
          {filters.country && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Страна: {filters.country}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleFilterChange('country', undefined)}
              />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Статус: {filters.status}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleFilterChange('status', undefined)}
              />
            </Badge>
          )}
          {filters.productName && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Продукт: {filters.productName}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleFilterChange('productName', undefined)}
              />
            </Badge>
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Период: {filters.dateFrom || '...'} - {filters.dateTo || '...'}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => {
                  handleFilterChange('dateFrom', undefined);
                  handleFilterChange('dateTo', undefined);
                }}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Advanced Filters Toggle */}
      <div className="mb-4">
        <button
          onClick={() => setAdvancedVisible(!isAdvancedVisible)}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <Filter className="w-4 h-4" />
          <span>Расширенные фильтры</span>
          <motion.div
            animate={{ rotate: isAdvancedVisible ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {isAdvancedVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-visible"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-gray-200">
              {/* Vertical Filter */}
              <FilterSelect
                label="Вертикаль"
                value={filters.vertical}
                onChange={(value) => handleFilterChange('vertical', value)}
                options={Object.values(VerticalEnum) as string[]}
                placeholder="Выберите вертикаль"
              />

              {/* Country Filter */}
              <FilterSelect
                label="Страна"
                value={filters.country}
                onChange={(value) => handleFilterChange('country', value)}
                options={Object.values(CountryEnum) as string[]}
                placeholder="Выберите страну"
              />

              {/* Status Filter */}
              <FilterSelect
                label="Статус"
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                options={Object.values(StatusEnum) as string[]}
                placeholder="Выберите статус"
              />

              {/* Product Name Filter */}
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название продукта
                </label>
                <input
                  type="text"
                  value={filters.productName || ''}
                  onChange={(e) => handleFilterChange('productName', e.target.value)}
                  placeholder="Введите название продукта"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Date Range Filter */}
              <div className="md:col-span-2 lg:col-span-2">
                <FilterDateRange
                  label="Период"
                  fromDate={filters.dateFrom}
                  toDate={filters.dateTo}
                  onFromDateChange={(date) => handleFilterChange('dateFrom', date)}
                  onToDateChange={(date) => handleFilterChange('dateTo', date)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Filter Select Component
const FilterSelect: FC<{
  label: string;
  value?: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
}> = ({ label, value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            <ul>
              <li
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
              >
                Все
              </li>
              {options.map((option) => (
                <li
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  {option}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Date Range Filter Component
const FilterDateRange: FC<{
  label: string;
  fromDate?: string;
  toDate?: string;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
}> = ({ label, fromDate, toDate, onFromDateChange, onToDateChange }) => {
  const [isCalendarOpen, setCalendarOpen] = useState<null | 'from' | 'to'>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setCalendarOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'dd/mm/yyyy';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const handleDateSelect = (date: Date | null, type: 'from' | 'to') => {
    const dateString = date ? date.toISOString().split('T')[0] : undefined; // YYYY-MM-DD format or undefined
    if (type === 'from') {
      onFromDateChange(dateString || '');
    } else {
      onToDateChange(dateString || '');
    }
  };

  const handleCloseCalendar = () => {
    setCalendarOpen(null);
  };

  return (
    <div ref={ref}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <button
            onClick={() => setCalendarOpen(isCalendarOpen === 'from' ? null : 'from')}
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
            type="button"
          >
            <span className={fromDate ? 'text-gray-900' : 'text-gray-500'}>
              {formatDate(fromDate)}
            </span>
            <CalendarIcon className="w-4 h-4 text-gray-400" />
          </button>
          {isCalendarOpen === 'from' && (
            <div className="absolute z-20 mt-1">
              <Calendar
                selected={fromDate ? new Date(fromDate) : null}
                onChange={(date) => handleDateSelect(date, 'from')}
                onClose={handleCloseCalendar}
              />
            </div>
          )}
        </div>
        <span className="text-gray-400">-</span>
        <div className="relative flex-1">
          <button
            onClick={() => setCalendarOpen(isCalendarOpen === 'to' ? null : 'to')}
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
            type="button"
          >
            <span className={toDate ? 'text-gray-900' : 'text-gray-500'}>
              {formatDate(toDate)}
            </span>
            <CalendarIcon className="w-4 h-4 text-gray-400" />
          </button>
          {isCalendarOpen === 'to' && (
            <div className="absolute z-20 mt-1">
              <Calendar
                selected={toDate ? new Date(toDate) : null}
                onChange={(date) => handleDateSelect(date, 'to')}
                onClose={handleCloseCalendar}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadsFiltersComponent;
