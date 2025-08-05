'use client';

import { useState } from 'react';

import LeadsFiltersComponent from "@/features/leads/components/LeadsManagement/LeadsFilters";
import LeadsTable from "@/features/leads/components/LeadsManagement/LeadsTable";
import PageHeader from '@/shared/components/PageHeader';
import { LeadsFilters } from '@/features/leads/model/schemas';

const LeadsView = () => {
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<LeadsFilters>({});

    const handleClearFilters = () => {
        setFilters({});
    };

    return (
        <>
            <PageHeader
                title="Лиды"
                description="Управление и отслеживание всех лидов"
                firstButtonText="Импорт лидов"
                secondButtonText="Экспорт"
                isSecondButtonIcon={false}
            />
            <LeadsFiltersComponent
                searchQuery={search}
                onSearchChange={setSearch}
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={handleClearFilters}
            />
            <LeadsTable searchQuery={search} filters={filters} />
        </>
    );
};

export default LeadsView;