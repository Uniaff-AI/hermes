'use client';

import { useState } from 'react';
import OffersFilters from '@/features/offers/components/OffersManagement/OffersFilters';
import OffersTable from '@/features/offers/components/OffersManagement/OffersTable';
import PageHeader from '@/shared/components/PageHeader';
import { OffersFilters as OffersFiltersType } from '@/features/offers/model/schemas';

const OffersView = () => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<OffersFiltersType>({});

  const handleClearFilters = () => {
    setFilters({});
  };

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
        filters={filters}
        onFiltersChange={setFilters}
        onAdvancedClick={() => console.log('Расширенные фильтры')}
      />
      <OffersTable searchQuery={search} filters={filters} />
    </>
  );
};

export default OffersView;
