'use client';

import { useState } from 'react';
import PageHeader from '@/shared/components/PageHeader';
import { ProductsFilters as ProductsFiltersType } from '@/features/products/model/schemas';
import ProductsFilters from '@/features/products/components/ProductsManagement/ProductsFilters';
import ProductsTable from '@/features/products/components/ProductsManagement/ProductsTable';

const ProductsView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ProductsFiltersType>({});

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  return (
    <>
      <PageHeader
        title="Продукты"
        description="Детальная таблица всех продуктов и их статистики"
        firstButtonText="Импорт продуктов"
        secondButtonText="Создать продукт"
        isSecondButtonIcon={true}
      />
      <ProductsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
      />
      <ProductsTable searchQuery={searchQuery} filters={filters} />
    </>
  );
};

export default ProductsView;
