'use client';

import { useState } from 'react';
import OffersFilters from '@/components/dashboard/OffersFilters';
import OffersTable from '@/components/dashboard/OffersTable';
import PageHeader from '@/shared/components/PageHeader';

const OffersView = () => {
    const [search, setSearch] = useState('');

    return (
        <>
            <PageHeader
                title="Офферы"
                description="Детальная таблица всех офферов и их статистики"
                firstButtonText="Импорт офферов"
                secondButtonText="Создать оффер"
                isSecondButtonIcon={true}
            />
            <OffersFilters
                value={search}
                onChange={setSearch}
                onAdvancedClick={() => console.log('Расширенные фильтры')}
            />
            <OffersTable searchQuery={search} />
        </>
    );
};

export default OffersView;
