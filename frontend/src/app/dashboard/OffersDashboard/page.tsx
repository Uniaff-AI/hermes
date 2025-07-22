'use client';

import { useState } from 'react';
import OffersFilters from '@/components/dashboard/OffersFilters';
import OffersTable from '@/components/dashboard/OffersTable';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const OffersDashboardPage = () => {
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState('offers');

    return (
        <main className="bg-[#F9FAFB] min-h-screen py-6 px-6">
            {/* Tabs на всю ширину, как на макете */}
            <div className="w-full mb-6">
                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList className="w-full flex justify-start bg-transparent border-b border-gray-200">
                        <TabsTrigger
                            value="offers"
                            className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black text-gray-500"
                        >
                            Offers Dashboard
                        </TabsTrigger>
                        <TabsTrigger
                            value="leads"
                            className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black text-gray-500"
                        >
                            Leads Management
                        </TabsTrigger>
                        <TabsTrigger
                            value="redirects"
                            className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black text-gray-500"
                        >
                            Redirects
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Заголовок + кнопки */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Offers Dashboard</h1>
                    <p className="text-sm text-gray-500">Детальная таблица всех офферов и их статистики</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">⬇️ Импорт офферов</Button>
                    <Button>+ Создать оффер</Button>
                </div>
            </div>

            {/* Контент табов */}
            {tab === 'offers' && (
                <>
                    <OffersFilters
                        value={search}
                        onChange={setSearch}
                        onAdvancedClick={() => console.log('Расширенные фильтры')}
                    />
                    <OffersTable searchQuery={search} />
                </>
            )}

            {tab === 'leads' && (
                <div className="mt-6 text-gray-500">💡 Leads management coming soon...</div>
            )}

            {tab === 'redirects' && (
                <div className="mt-6 text-gray-500">🔁 Redirect management coming soon...</div>
            )}
        </main>
    );
};

export default OffersDashboardPage;
