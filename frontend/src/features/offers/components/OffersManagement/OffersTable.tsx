'use client';

import { useProducts } from '../../model/hooks';
import { Product } from '../../model/schemas';
import type { OffersFilters } from '../../model/schemas';
import React, { FC, useMemo } from 'react';

type OffersTableProps = {
  searchQuery: string;
  filters?: OffersFilters;
};

const OffersTable: FC<OffersTableProps> = ({ searchQuery, filters = {} }) => {
  const { data: offers = [], isLoading, error } = useProducts();

  const filteredOffers = useMemo(() => {
    if (!Array.isArray(offers) || offers.length === 0) {
      return [];
    }

    let filtered = offers;

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (offer) =>
          offer.productName?.toLowerCase().includes(lowerQuery) ||
          offer.productId?.toLowerCase().includes(lowerQuery) ||
          offer.country?.toLowerCase().includes(lowerQuery) ||
          offer.vertical?.toLowerCase().includes(lowerQuery) ||
          offer.aff?.toLowerCase().includes(lowerQuery)
      );
    }

    if (filters.country) {
      filtered = filtered.filter((offer) => offer.country === filters.country);
    }

    if (filters.vertical) {
      filtered = filtered.filter(
        (offer) => offer.vertical === filters.vertical
      );
    }

    if (filters.aff) {
      filtered = filtered.filter((offer) => offer.aff === filters.aff);
    }

    return filtered;
  }, [offers, searchQuery, filters]);

  if (isLoading) {
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
          Ошибка загрузки офферов:{' '}
          {error instanceof Error ? error.message : 'Неизвестная ошибка'}
        </div>
      </div>
    );
  }

  if (!Array.isArray(offers) || offers.length === 0) {
    return (
      <div className="bg-white p-8 rounded shadow">
        <div className="text-center text-gray-500">
          Нет доступных офферов
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b text-gray-600 font-medium">
            <th className="py-2 px-3">ID</th>
            <th className="py-2 px-3">Название</th>
            <th className="py-2 px-3">Страна</th>
            <th className="py-2 px-3">Вертикаль</th>
            <th className="py-2 px-3">Аффилиат</th>
          </tr>
        </thead>
        <tbody>
          {filteredOffers.length > 0 ? (
            filteredOffers.map((offer, index) => (
              <tr
                key={`${offer.productId}-${index}`}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="py-2 px-3">{offer.productId}</td>
                <td className="py-2 px-3 text-blue-600 cursor-pointer hover:underline">
                  {offer.productName}
                </td>
                <td className="py-2 px-3">{offer.country}</td>
                <td className="py-2 px-3">{offer.vertical}</td>
                <td className="py-2 px-3">{offer.aff}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center py-6 text-gray-500">
                {searchQuery || Object.values(filters).some((f) => f)
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
