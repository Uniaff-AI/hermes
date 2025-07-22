'use client';

import { FC } from 'react';
import { Filter, Search } from 'lucide-react';

type OffersFiltersProps = {
    value: string;
    onChange: (value: string) => void;
    onAdvancedClick?: () => void;
};

const OffersFilters: FC<OffersFiltersProps> = ({
                                                   value,
                                                   onChange,
                                                   onAdvancedClick,
                                               }) => {
    return (
        <div className="bg-white rounded shadow p-4 mb-6">
            {/* Заголовок блока фильтров */}
            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
                <Filter className="w-4 h-4" />
                <span>Фильтры по офферам</span>
            </div>

            {/* Поисковое поле */}
            <div className="relative mb-2">
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Поиск по ID, названию, группе..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
            </div>

            {/* Расширенные фильтры */}
            <button
                type="button"
                onClick={onAdvancedClick}
                className="text-sm text-blue-600 hover:underline"
            >
                Расширенные фильтры
            </button>
        </div>
    );
};

export default OffersFilters;
