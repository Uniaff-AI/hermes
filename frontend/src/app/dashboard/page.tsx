'use client';

import { useState } from 'react';

import LeadsView from '@/app/dashboard/LeadsManagement/page';
import OffersView from '@/app/dashboard/OffersDashboard/page';
import RedirectsView from '@/app/dashboard/Redirects/page';

type TabKey = 'offers' | 'leads' | 'redirects';

const tabLabels: Record<TabKey, string> = {
  offers: 'Offers Dashboard',
  leads: 'Leads Management',
  redirects: 'Redirects',
};

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('offers');

  const renderTabs = () => {
    try {
      if (!tabLabels || typeof tabLabels !== 'object') {
        return null;
      }

      return Object.entries(tabLabels).map(([key, label]) => (
        <button
          key={key}
          onClick={() => setActiveTab(key as TabKey)}
          className={`w-full py-3 text-sm font-medium text-center border-b-2 transition-all
                          ${activeTab === key
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          {label}
        </button>
      ));
    } catch (error) {
      console.error('Error rendering tabs:', error);
      return null;
    }
  };

  return (
    <main className="bg-[#F9FAFB] min-h-screen py-6 px-6">
      <div className="w-full grid grid-cols-3 border-b border-gray-200 mb-6">
        {renderTabs()}
      </div>

      {activeTab === 'offers' && <OffersView />}
      {activeTab === 'leads' && <LeadsView />}
      {activeTab === 'redirects' && <RedirectsView />}
    </main>
  );
};

export default DashboardPage;
