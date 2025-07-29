'use client';

import { FC } from 'react';
import { Settings, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type RedirectRule = {
    id: string;
    name: string;
    status: 'active' | 'inactive';
    offer: string;
    partner: string;
    period: string;
    frequency: string;
    dailyLimit: number;
    sendTime: string;
};

const demoRule: RedirectRule = {
    id: 'rule-1',
    name: 'Forex Premium Rule',
    status: 'active',
    offer: 'VIP Forex Trading',
    partner: 'Partner 1',
    period: '7 days',
    frequency: '5–15 минут',
    dailyLimit: 100,
    sendTime: '09:00–18:00',
};

const RedirectRulesView: FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border p-6 shadow">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-green-500" />
                        <h2 className="text-lg font-semibold text-gray-900">{demoRule.name}</h2>
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                            {demoRule.status === 'active' ? 'Активно' : 'Неактивно'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-gray-100 rounded">
                            <Settings className="w-5 h-5 text-gray-500" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded">
                            <Filter className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-x-8 gap-y-4 text-sm text-gray-600">
                    <div>
                        <div className="uppercase text-xs mb-1">Оффер</div>
                        <div className="font-medium text-gray-900">{demoRule.offer}</div>
                    </div>
                    <div>
                        <div className="uppercase text-xs mb-1">ПП</div>
                        <div className="font-medium text-gray-900">{demoRule.partner}</div>
                    </div>
                    <div>
                        <div className="uppercase text-xs mb-1">Период</div>
                        <div className="font-medium text-gray-900">{demoRule.period}</div>
                    </div>
                    <div>
                        <div className="uppercase text-xs mb-1">Частота</div>
                        <div className="font-medium text-gray-900">{demoRule.frequency}</div>
                    </div>
                    <div>
                        <div className="uppercase text-xs mb-1">Лимит в день</div>
                        <div className="inline-block bg-gray-100 px-3 py-1 rounded-full font-semibold text-gray-900">
                            {demoRule.dailyLimit} лидов
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center text-xs text-gray-500">
                    <span className="mr-1">🕒</span>
                    <span>Время отправки:</span>
                    <span className="ml-2 font-medium text-gray-900">{demoRule.sendTime}</span>
                </div>
            </div>
        </div>
    );
};

export default RedirectRulesView;
