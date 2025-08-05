'use client';

import { usePathname, useRouter } from 'next/navigation';

import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';

const TabsNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();

  const currentTab = pathname.includes('/Redirects')
    ? 'redirects'
    : pathname.includes('/LeadsManagement')
      ? 'leads'
      : 'offers';

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'offers':
        router.push('/dashboard/OffersDashboard');
        break;
      case 'leads':
        router.push('/dashboard/LeadsManagement');
        break;
      case 'redirects':
        router.push('/dashboard/Redirects');
        break;
    }
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange}>
      <TabsList className="w-full grid grid-cols-3 bg-transparent border-b border-gray-200 mb-6">
        <TabsTrigger
          value="offers"
          className="w-full px-4 py-3 text-sm font-medium text-center border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black text-gray-500"
        >
          Offers Dashboard
        </TabsTrigger>
        <TabsTrigger
          value="leads"
          className="w-full px-4 py-3 text-sm font-medium text-center border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black text-gray-500"
        >
          Leads Management
        </TabsTrigger>
        <TabsTrigger
          value="redirects"
          className="w-full px-4 py-3 text-sm font-medium text-center border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black text-gray-500"
        >
          Redirects
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default TabsNavigation;
