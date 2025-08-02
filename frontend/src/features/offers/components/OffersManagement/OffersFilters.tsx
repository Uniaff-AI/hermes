'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Filter, Search } from 'lucide-react';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { CountryEnum, VerticalEnum, AffEnum } from '@/shared/types/enums';
import type { OffersFilters } from '../../model/schemas';

type OffersFiltersProps = {
    value: string;
    onChange: (value: string) => void;
    onAdvancedClick?: () => void;
    filters?: OffersFilters;
    onFiltersChange?: (filters: OffersFilters) => void;
};

const OffersFilters: FC<OffersFiltersProps> = ({
    value,
    onChange,
    filters = {},
    onFiltersChange
}) => {
    const [isAdvancedVisible, setAdvancedVisible] = useState(false);

    const filterOptions = useMemo(
        () => ({
            country: Object.values(CountryEnum) as string[],
            vertical: Object.values(VerticalEnum) as string[],
            aff: Object.values(AffEnum) as string[],
        }),
        []
    );

    const handleFilterChange = (filterType: 'country' | 'vertical' | 'aff', value: string) => {
        const newFilters = { ...filters };
        if (value === 'Все') {
            delete newFilters[filterType];
        } else {
            // Ensure the value is a valid enum value
            const enumValues = filterOptions[filterType];
            if (enumValues.includes(value)) {
                newFilters[filterType] = value as any;
            }
        }

        onFiltersChange?.(newFilters);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
                <Filter className="w-4 h-4" />
                <h2 className="text-lg font-semibold text-gray-800">Фильтры по офферам</h2>
            </div>

            <div className="mt-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Поиск по ID, названию, группе..."
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

// Custom Dropdown Component
const FilterSelect: FC<{
    label: string;
    color: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
}> = ({
    label,
    color,
    options,
    value,
    onChange,
}) => {
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

        const allOptions = ['Все', ...options];

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

export default OffersFilters;
