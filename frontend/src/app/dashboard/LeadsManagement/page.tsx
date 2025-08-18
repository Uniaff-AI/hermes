'use client';

import { useState } from 'react';

import LeadsFiltersComponent from '@/features/leads/components/LeadsManagement/LeadsFilters';
import LeadsTable from '@/features/leads/components/LeadsManagement/LeadsTable';
import PageHeader from '@/shared/components/PageHeader';
import { LeadsFilters } from '@/features/leads/model/schemas';

const LeadsView = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<LeadsFilters>({});

  const handleSearchChange = (searchQuery: string) => {
    setSearchQuery(searchQuery);
  };

  const handleFiltersChange = (newFilters: LeadsFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
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
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />
      <LeadsTable searchQuery={searchQuery} filters={filters} />
    </>
  );
};

export default LeadsView;
