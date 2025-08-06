'use client';

import { FC, useMemo, useEffect, useState } from 'react';
import { useProducts } from '../../model/hooks';
import { Product } from '../../model/schemas';
import type { OffersFilters } from '../../model/schemas';

type OffersTableProps = {
  searchQuery: string;
  filters?: OffersFilters;
};

const OffersTable: FC<OffersTableProps> = ({ searchQuery, filters = {} }) => {
  const [isClient, setIsClient] = useState(false);
  const { data: offers = [], isLoading, error } = useProducts();

  // Ensure this only runs on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredOffers = useMemo(() => {
    // Return empty array during SSR or if data is invalid
    if (!isClient || !offers || !Array.isArray(offers) || offers.length === 0) {
      return [];
    }

    try {
      let filtered = [...offers]; // Create a copy to avoid mutations

      if (searchQuery?.trim()) {
        const lowerQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (offer) =>
            offer?.productName?.toLowerCase()?.includes(lowerQuery) ||
            offer?.productId?.toLowerCase()?.includes(lowerQuery) ||
            offer?.country?.toLowerCase()?.includes(lowerQuery) ||
            offer?.vertical?.toLowerCase()?.includes(lowerQuery) ||
            offer?.aff?.toLowerCase()?.includes(lowerQuery)
        );
      }

      if (filters?.country) {
        filtered = filtered.filter((offer) => offer?.country === filters.country);
      }

      if (filters?.vertical) {
        filtered = filtered.filter(
          (offer) => offer?.vertical === filters.vertical
        );
      }

      if (filters?.aff) {
        filtered = filtered.filter((offer) => offer?.aff === filters.aff);
      }

      return filtered;
    } catch (error) {
      console.error('Error filtering offers:', error);
      return [];
    }
  }, [isClient, offers, searchQuery, filters]);

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
      <div className="bg-white p-8 rounded shadow">
        <div className="text-center text-gray-500">Загрузка офферов...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded shadow">
        <div className="text-center text-red-500">
          Ошибка загрузки офферов: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded shadow">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-2">Product Name</th>
            <th className="text-left py-3 px-2">Product ID</th>
            <th className="text-left py-3 px-2">Country</th>
            <th className="text-left py-3 px-2">Vertical</th>
            <th className="text-left py-3 px-2">Affiliate</th>
          </tr>
        </thead>
        <tbody>
          {filteredOffers.length > 0 ? (
            filteredOffers.map((offer, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2">{offer.productName}</td>
                <td className="py-3 px-2">{offer.productId}</td>
                <td className="py-3 px-2">{offer.country}</td>
                <td className="py-3 px-2">{offer.vertical}</td>
                <td className="py-3 px-2">{offer.aff}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center py-6 text-gray-500">
                {searchQuery?.trim() || hasActiveFilters()
                  ? 'Офферы не найдены по вашему запросу.'
                  : 'Офферы не найдены.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OffersTable;
