'use client';

import { useState } from 'react';

import LeadsFilters from "@/components/leadsManagement/LeadsFilters";
import LeadsTable from "@/components/leadsManagement/LeadsTable";
import PageHeader from '@/shared/components/PageHeader';

const LeadsView = () => {
    const [search, setSearch] = useState('');

    return (
        <>
            <PageHeader
                title="Лиды"
                description="Управление и отслеживание всех лидов"
                firstButtonText="Импорт лидов   "
                secondButtonText="Экспорт"
                isSecondButtonIcon={false}
            />
            <LeadsFilters
                value={search}
                onChange={setSearch}
                onAdvancedClick={() => console.log('Расширенные фильтры')}
            />
            <LeadsTable searchQuery={search} />
        </>
    );
};

export default LeadsView;