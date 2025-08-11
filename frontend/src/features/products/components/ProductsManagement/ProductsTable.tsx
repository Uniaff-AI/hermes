'use client';

import { FC, useMemo, useEffect, useState } from 'react';
import { useProducts } from '../../model/hooks';
import type { ProductsFilters } from '../../model/schemas';

type ProductsTableProps = {
  searchQuery: string;
  filters: ProductsFilters;
};

const ProductsTable: FC<ProductsTableProps> = ({ searchQuery, filters }) => {
  const [isClient, setIsClient] = useState(false);
  const { data: products = [], isLoading, error } = useProducts();

  // Ensure this only runs on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!isClient || !products || !Array.isArray(products) || products.length === 0) {
      return [];
    }

    try {
      let filtered = [...products];

      if (searchQuery?.trim()) {
        const lowerQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (product) =>
            product?.productName?.toLowerCase()?.includes(lowerQuery) ||
            product?.productId?.toLowerCase()?.includes(lowerQuery) ||
            product?.country?.toLowerCase()?.includes(lowerQuery) ||
            product?.vertical?.toLowerCase()?.includes(lowerQuery) ||
            product?.aff?.toLowerCase()?.includes(lowerQuery)
        );
      }

      if (filters?.country) {
        filtered = filtered.filter((product) => product?.country === filters.country);
      }

      if (filters?.vertical) {
        filtered = filtered.filter(
          (product) => product?.vertical === filters.vertical
        );
      }

      if (filters?.aff) {
        filtered = filtered.filter((product) => product?.aff === filters.aff);
      }

      return filtered;
    } catch (error) {
      console.error('Error filtering products:', error);
      return [];
    }
  }, [isClient, products, searchQuery, filters]);

  const hasActiveFilters = () => {
    try {
      if (!filters || typeof filters !== 'object' || filters === null) {
        return false;
      }
      return Object.keys(filters).length > 0 &&
        Object.values(filters).some((f) => f !== undefined && f !== null && String(f).trim() !== '');
    } catch (error) {
      console.error('Error checking active filters:', error);
      return false;
    }
  };

  if (!isClient || isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center text-gray-500">Загрузка офферов...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center text-red-500">
          Ошибка загрузки офферов: {error.message}
        </div>
      </div>
    );
  }

  if (!Array.isArray(filteredProducts) || filteredProducts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          {searchQuery?.trim() || hasActiveFilters()
            ? 'Продукты не найдены по вашему запросу.'
            : 'Продукты не найдены.'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Продукты</h2>
        <p className="text-sm text-gray-500">
          Показано {filteredProducts.length} продуктов
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vertical
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Affiliate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.productName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.productId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.country}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.vertical}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {product.aff}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsTable;
