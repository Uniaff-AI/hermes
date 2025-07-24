'use client';

import { Filter,Settings } from 'lucide-react';
import { FC } from 'react';

import { Badge } from '@/components/ui/badge';

// Тип правила
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

// Статичная демо-правила
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
        <div className="space-y-4">
            <div className="bg-white rounded-lg border p-6 shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <h2 className="text-base font-semibold text-gray-900">{demoRule.name}</h2>
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">Активно</Badge>
                    </div>
                    <div className="flex gap-2">
                        <button><Settings className="w-4 h-4 text-gray-500" /></button>
                        <button><Filter className="w-4 h-4 text-gray-500" /></button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                    <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Оффер</div>
                        <div className="text-sm text-gray-900">{demoRule.offer}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">ПП</div>
                        <div className="text-sm text-gray-900">{demoRule.partner}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Период</div>
                        <div className="text-sm text-gray-900">{demoRule.period}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Частота</div>
                        <div className="text-sm text-gray-900">{demoRule.frequency}</div>
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Лимит в день</div>
                        <div className="text-sm font-semibold bg-gray-100 px-2 py-0.5 rounded w-fit">
                            {demoRule.dailyLimit} лидов
                        </div>
                    </div>
                </div>

                {/* Sending Time */}
                <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                    <span>🕒 Время отправки:</span>
                    <span className="text-sm text-gray-900 font-medium">{demoRule.sendTime}</span>
                </div>
            </div>
        </div>
    );
};

export default RedirectRulesView;
