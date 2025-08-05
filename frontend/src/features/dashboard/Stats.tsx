import { DollarSign, Target, TrendingUp, Users } from 'lucide-react';
import { useLeads } from '@/features/leads/model/hooks';
import { useProducts } from '@/features/offers/model/hooks';

import StatsCard from './StatsCard';

const Stats = () => {
    const { data: leads = [], isLoading: leadsLoading } = useLeads();
    const { data: products = [], isLoading: productsLoading } = useProducts();

    const activeOffers = products.length;
    const totalLeads = leads.length;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
                title="Total Leads"
                value={leadsLoading ? "..." : totalLeads.toString()}
                change="+12.3%"
                icon={<Users className="w-6 h-6" />}
                isLoading={leadsLoading}
            />
            <StatsCard
                title="Active Offers"
                value={productsLoading ? "..." : activeOffers.toString()}
                change="+2"
                icon={<Target className="w-6 h-6" />}
                isLoading={productsLoading}
            />
            <StatsCard
                title="Sales Count"
                value="1"
                change="+0.8%"
                icon={<TrendingUp className="w-6 h-6" />}
            // TODO: Implement backend API for sales count
            // Need to create API endpoint that returns total sales/conversions
            // This should count leads with status 'converted' or similar
            />
            <StatsCard
                title="Total Revenue"
                value="$27.00"
                change="+18.2%"
                icon={<DollarSign className="w-6 h-6" />}
            // TODO: Implement backend API for revenue calculation
            // Need to create API endpoint that calculates total revenue
            // This should sum up revenue from all converted leads
            />
        </div>
    );
};

export default Stats;
