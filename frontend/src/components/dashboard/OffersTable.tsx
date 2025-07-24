'use client';

import { OffersTableProps, mockOffers } from '@/__mocks__/offers';
import React, { FC } from 'react';

const OffersTable: FC<OffersTableProps> = ({ searchQuery }) => {
    const filteredOffers = mockOffers.filter((offer) => {
        const lowerQuery = searchQuery.toLowerCase();
        return (
            offer.title.toLowerCase().includes(lowerQuery) ||
            offer.group.toLowerCase().includes(lowerQuery) ||
            offer.id.toString().includes(lowerQuery)
        );
    });

    return (
        <div className="bg-white p-4 rounded shadow">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="text-left border-b text-gray-600 font-medium">
                        <th className="py-2 px-3">ID</th>
                        <th className="py-2 px-3">Название</th>
                        <th className="py-2 px-3">Группа</th>
                        <th className="py-2 px-3">Клики</th>
                        <th className="py-2 px-3">Лиды</th>
                        <th className="py-2 px-3">Продажи</th>
                        <th className="py-2 px-3">CR</th>
                        <th className="py-2 px-3">EPC</th>
                        <th className="py-2 px-3">Статус</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOffers.length > 0 ? (
                        filteredOffers.map((offer) => (
                            <tr key={offer.id} className="border-b hover:bg-gray-50 transition">
                                <td className="py-2 px-3">{offer.id}</td>
                                <td className="py-2 px-3 text-blue-600 cursor-pointer hover:underline">
                                    {offer.title}
                                </td>
                                <td className="py-2 px-3">{offer.group}</td>
                                <td className="py-2 px-3">{offer.clicks}</td>
                                <td className="py-2 px-3">{offer.leads}</td>
                                <td className="py-2 px-3">{offer.sales}</td>
                                <td className="py-2 px-3">{offer.cr}</td>
                                <td className="py-2 px-3">{offer.epc}</td>
                                <td className="py-2 px-3">
                                    <span
                                        className={
                                            offer.status === 'Активный'
                                                ? 'text-green-600 font-medium'
                                                : offer.status === 'Отключен'
                                                    ? 'text-red-500 font-medium'
                                                    : 'text-yellow-600 font-medium'
                                        }
                                    >
                                        {offer.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={9} className="text-center py-6 text-gray-500">
                                Офферы не найдены.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default OffersTable;
