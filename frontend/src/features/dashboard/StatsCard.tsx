import { FC, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string;
    change: string;
    icon: ReactNode;
    isLoading?: boolean;
}

const StatsCard: FC<StatsCardProps> = ({ title, value, change, icon, isLoading = false }) => {
    return (
        <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow-md w-full">
            <div>
                <h3 className="text-gray-500 text-sm">{title}</h3>
                <div className="flex items-center gap-2">
                    {isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    ) : (
                        <p className="text-2xl font-bold">{value}</p>
                    )}
                </div>
                <p className="text-sm text-green-600 mt-1">{change} vs last month</p>
            </div>
            <div className="text-white bg-gradient-to-r from-indigo-400 to-purple-500 p-2 rounded-md">
                {icon}
            </div>
        </div>
    );
};

export default StatsCard;
