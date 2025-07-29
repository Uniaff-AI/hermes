'use client';

import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit2, Copy, Trash2, Shield, Clock } from 'lucide-react';

type RedirectRule = {
    id: string;
    name: string;
    status: 'active' | 'paused';
    offer: string;
    partner: string;
    period: string;
    frequency: string;
    dailyLimit: number;
    sendTime: string;
};

const allRules: RedirectRule[] = [
    {
        id: 'rule-1',
        name: 'Forex Premium Rule',
        status: 'active',
        offer: 'VIP Forex Trading',
        partner: 'Partner 1',
        period: '7 days',
        frequency: '5–15 минут',
        dailyLimit: 100,
        sendTime: '09:00–18:00',
    },
    {
        id: 'rule-2',
        name: 'Crypto Basic Rule',
        status: 'paused',
        offer: 'Crypto Investment Pro',
        partner: 'Partner 2',
        period: '3 days',
        frequency: '10–30 минут',
        dailyLimit: 50,
        sendTime: '12:00–20:00',
    },
];

const AllRulesView: FC = () => (
    <div className="space-y-6">
        <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900">Все Правила</h2>
            <p className="text-sm text-muted-foreground">
                Полный список созданных правил перенаправления
            </p>
        </div>
        <div className="space-y-4">
            {allRules.map((rule) => (
                <Card key={rule.id} className="p-6 relative bg-white rounded-2xl border">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded">
                            <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded">
                            <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded">
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
            <span
                className={`w-3 h-3 rounded-full ${
                    rule.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                }`}
            />
                        <h3 className="text-base font-medium text-gray-900">{rule.name}</h3>
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                            {rule.status === 'active' ? 'Активно' : 'Пауза'}
                        </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-sm text-gray-600">
                        <div>
                            <div className="uppercase text-xs mb-1">Оффер</div>
                            <div className="font-medium text-gray-900">{rule.offer}</div>
                        </div>
                        <div>
                            <div className="uppercase text-xs mb-1">ПП</div>
                            <div className="font-medium text-gray-900">{rule.partner}</div>
                        </div>
                        <div>
                            <div className="uppercase text-xs mb-1">Период</div>
                            <div className="font-medium text-gray-900">{rule.period}</div>
                        </div>
                        <div>
                            <div className="uppercase text-xs mb-1">Частота</div>
                            <div className="font-medium text-gray-900">{rule.frequency}</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-gray-400" />
                            <span>Лимит в день:</span>
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                                {rule.dailyLimit} лидов
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>Время отправки:</span>
                            <span className="inline-block bg-gray-100 text-xs px-2 py-0.5 rounded">
                {rule.sendTime}
              </span>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    </div>
);

export default AllRulesView;
