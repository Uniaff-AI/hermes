'use client';

import { mockLeads } from '@/__mocks__/leads';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronDown, Filter, Search } from 'lucide-react';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';

// Helper to get unique values from mock data
const getUniqueValues = (key: keyof (typeof mockLeads)[0]) => {
  const values = mockLeads.map((lead) => lead[key]);
  return ['Все', ...Array.from(new Set(values))];
};

type LeadsFiltersProps = {
  value: string;
  onChange: (value: string) => void;
  onAdvancedClick?: () => void;
};

const LeadsFilters: FC<LeadsFiltersProps> = ({ value, onChange }) => {
  const [isAdvancedVisible, setAdvancedVisible] = useState(false);

  const filterOptions = useMemo(
    () => ({
      status: getUniqueValues('status'),
      partner: ['Все партнеры', 'M1-shop.ru', 'Other Partner'], // Example static options
      country: getUniqueValues('country'),
      kt: getUniqueValues('clientTracker'),
      lending: getUniqueValues('lending'),
      offer: getUniqueValues('offer'),
      pp: getUniqueValues('partnerProgram'),
      campaign: getUniqueValues('companyName'),
    }),
    []
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
        <Filter className="w-4 h-4" />
        <h2 className="text-lg font-semibold text-gray-800">Фильтры по лидам</h2>
      </div>

      <div className="mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Поиск по SubID, имени, телефону, e-mail..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={() => setAdvancedVisible(!isAdvancedVisible)}
          className="flex items-center gap-2 text-sm font-medium hover:text-blue-700"
        >
          <Filter className="w-4 h-4" />
          <span>Расширенные фильтры по колонкам</span>
          <motion.div
            animate={{ rotate: isAdvancedVisible ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {isAdvancedVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-6">
              {/* Column 1 */}
              <div>
                <FilterSelect label="Статус лида" color="bg-green-500" options={filterOptions.status} />
                <FilterSelect label="Партнер" color="bg-purple-500" options={filterOptions.partner} />
                <FilterSelect label="Страна" color="bg-red-500" options={filterOptions.country} />
                <FilterSelect label="КТ" color="bg-pink-500" options={filterOptions.kt} />
                <FilterSelect label="Лендинг" color="bg-yellow-500" options={filterOptions.lending} />
              </div>
              {/* Column 2 */}
              <div>
                <FilterDateRange label="Период" color="bg-blue-500" />
                <FilterSelect label="Оффер" color="bg-orange-500" options={filterOptions.offer} />
                <FilterSelect label="ПП" color="bg-cyan-500" options={filterOptions.pp} />
                <FilterSelect label="Кампания" color="bg-indigo-500" options={filterOptions.campaign} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Custom Dropdown Component
const FilterSelect: FC<{ label: string; color: string; options: (string | number)[] }> = ({
  label,
  color,
  options,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(options[0]);
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
    <div className="mb-4" ref={ref}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${color}`} />
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      </div>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span>{selected}</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''
              }`}
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
                {options.map((option, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setSelected(option);
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
    </div>
  );
};

const FilterDateRange: FC<{ label: string; color: string }> = ({ label, color }) => {
  const [isCalendarOpen, setCalendarOpen] = useState<null | 'from' | 'to'>(null);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
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

  const formatDate = (date: Date | null) => {
    return date ? date.toLocaleDateString('en-GB') : 'dd/mm/yyyy';
  };

  return (
    <div className="mb-4" ref={ref}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${color}`} />
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative w-full">
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
                selected={fromDate}
                onChange={setFromDate}
                onClose={() => setCalendarOpen(null)}
              />
            </div>
          )}
        </div>
        <span className="text-gray-400">-</span>
        <div className="relative w-full">
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
                selected={toDate}
                onChange={setToDate}
                onClose={() => setCalendarOpen(null)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadsFilters;
