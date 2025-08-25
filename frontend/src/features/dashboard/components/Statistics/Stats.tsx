import { DollarSign, Target, TrendingUp, Users } from 'lucide-react';
import { useLeadsStats } from '@/features/leads/model/hooks';
import { useProducts } from '@/features/products/model/hooks';
import { useRevenue } from '@/features/dashboard/model/hooks';
import { useEffect, useState, useMemo } from 'react';
import ErrorBoundary from '@/shared/providers/ErrorBoundary';
import { useLeads } from '@/features/leads/model/hooks';

import StatsCard from './StatsCard';

const StatsContent = () => {
  const { data: leads = [], isLoading: leadsLoading, error: leadsError } = useLeadsStats();
  const { data: products = [], isLoading: productsLoading, error: productsError } = useProducts();
  const { data: revenueData, isLoading: revenueLoading, error: revenueError } = useRevenue();
  const [isClient, setIsClient] = useState(false);

  const currentMonthLeads = useLeads({
    dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
  });

  const previousMonthLeads = useLeads({
    dateFrom: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
    dateTo: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0],
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const activeProducts = Array.isArray(products) ? products.length : 0;
  const totalLeads = Array.isArray(leads) ? leads.length : 0;

  // Calculate leads change
  const leadsChange = useMemo(() => {
    if (!currentMonthLeads.data || !previousMonthLeads.data) return '+0%';

    const currentCount = currentMonthLeads.data.length;
    const previousCount = previousMonthLeads.data.length;

    if (previousCount === 0) {
      return currentCount > 0 ? '+100%' : '+0%';
    }

    const changePercent = ((currentCount - previousCount) / previousCount) * 100;
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(1)}%`;
  }, [currentMonthLeads.data, previousMonthLeads.data]);

  if (!isClient) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Leads"
        value={leadsLoading ? '...' : leadsError ? 'Error' : totalLeads.toString()}
        change={leadsChange}
        icon={<Users className="w-6 h-6" />}
        isLoading={leadsLoading || currentMonthLeads.isLoading || previousMonthLeads.isLoading}
      />
      <StatsCard
        title="Active Products"
        value={productsLoading ? '...' : productsError ? 'Error' : activeProducts.toString()}
        change=""
        icon={<Target className="w-6 h-6" />}
        isLoading={productsLoading}
      />
      <StatsCard
        title="Sales Count"
        value={revenueLoading ? '...' : revenueError ? 'Error' : (revenueData?.countSales?.toString() || '0')}
        change={revenueData?.salesDiff ? `+${revenueData.salesDiff}` : '+0'}
        icon={<TrendingUp className="w-6 h-6" />}
        isLoading={revenueLoading}
      />
      <StatsCard
        title="Total Revenue"
        value={revenueLoading ? '...' : revenueError ? 'Error' : (revenueData?.revenue ? `$${revenueData.revenue.toFixed(2)}` : '$0.00')}
        change={revenueData?.revenueDiff ? `+$${revenueData.revenueDiff.toFixed(2)}` : '+$0.00'}
        icon={<DollarSign className="w-6 h-6" />}
        isLoading={revenueLoading}
      />
    </div>
  );
};

const Stats = () => {
  return (
    <ErrorBoundary>
      <StatsContent />
    </ErrorBoundary>
  );
};

export default Stats;
