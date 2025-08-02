import { FC, ReactNode } from 'react';

interface StatsCardProps {
    title: string;
    value: string;
    change: string;
    icon: ReactNode;
}

const StatsCard: FC<StatsCardProps> = ({ title, value, change, icon }) => {
    return (
        <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow-md w-full">
            <div>
                <h3 className="text-gray-500 text-sm">{title}</h3>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-green-600 mt-1">{change} vs last month</p>
            </div>
            <div className="text-white bg-gradient-to-r from-indigo-400 to-purple-500 p-2 rounded-md">
                {icon}
            </div>
        </div>
    );
};

export default StatsCard;
