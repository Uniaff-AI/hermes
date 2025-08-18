'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Filter, Search, X } from 'lucide-react';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { CountryEnum, VerticalEnum, AffEnum } from '@/shared/utilities/enums';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import type { ProductsFilters } from '../../model/schemas';

type ProductsFiltersProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: ProductsFilters;
  onFiltersChange: (filters: ProductsFilters) => void;
  onClearFilters: () => void;
};

const ProductsFilters: FC<ProductsFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [isAdvancedVisible, setAdvancedVisible] = useState(false);

  const filterOptions = useMemo(
    () => {
      try {
        return {
          country: (Object.values(CountryEnum) || []) as string[],
          vertical: (Object.values(VerticalEnum) || []) as string[],
          aff: (Object.values(AffEnum) || []) as string[],
        };
      } catch (error) {
        console.error('Error creating filter options:', error);
        return {
          country: [] as string[],
          vertical: [] as string[],
          aff: [] as string[],
        };
      }
    },
    []
  );

  const handleFilterChange = (
    filterType: 'country' | 'vertical' | 'aff',
    value: string
  ) => {
    const newFilters = { ...filters };
    if (value === 'Все') {
      delete newFilters[filterType];
    } else {
      const enumValues = filterOptions[filterType];
      if (enumValues.includes(value)) {
        newFilters[filterType] = value as any;
      }
    }

    onFiltersChange(newFilters);
  };

  const hasActiveFilters = filters && typeof filters === 'object' && Object.values(filters).some(
    (value) => value !== undefined && value !== null
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <h2 className="text-lg font-semibold text-gray-800">
            Фильтры по продуктам
          </h2>
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

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск по ID, названию, группе..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.vertical && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Вертикаль: {filters.vertical}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleFilterChange('vertical', 'Все')}
              />
            </Badge>
          )}
          {filters.country && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Страна: {filters.country}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleFilterChange('country', 'Все')}
              />
            </Badge>
          )}
          {filters.aff && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Аффилиат: {filters.aff}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleFilterChange('aff', 'Все')}
              />
            </Badge>
          )}
        </div>
      )}

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

      <AnimatePresence>
        {isAdvancedVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 pt-6">
              <FilterSelect
                label="Страна"
                color="bg-blue-500"
                options={filterOptions.country}
                value={filters.country || 'Все'}
                onChange={(value) => handleFilterChange('country', value)}
              />
              <FilterSelect
                label="Вертикаль"
                color="bg-purple-500"
                options={filterOptions.vertical}
                value={filters.vertical || 'Все'}
                onChange={(value) => handleFilterChange('vertical', value)}
              />
              <FilterSelect
                label="Аффилиат"
                color="bg-green-500"
                options={filterOptions.aff}
                value={filters.aff || 'Все'}
                onChange={(value) => handleFilterChange('aff', value)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FilterSelect: FC<{
  label: string;
  color: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}> = ({ label, color, options, value, onChange }) => {
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

  const allOptions = ['Все', ...(Array.isArray(options) ? options : [])];

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
          <span>{value}</span>
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
                {allOptions.map((option, i) => (
                  <li
                    key={i}
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
    </div>
  );
};

export default ProductsFilters;
