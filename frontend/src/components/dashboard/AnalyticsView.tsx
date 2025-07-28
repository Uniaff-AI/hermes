'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle,
    XCircle,
    ChevronDown,
    ChevronRight,
    Target
} from 'lucide-react';

interface Lead {
    name: string;
    email: string;
    phone: string;
    successes: number;
    errors: number;
}

interface Rule {
    id: string;
    ruleName: string;
    offer: string;
    channelType: 'Звонок' | 'Email' | 'SMS';
    sent: number;
    success: number;
    error: number;
    lastSent: string;
    leads: Lead[];
    leadsExpanded?: boolean;
}

const analytics = {
    totalSent: 14,
    sentDelta: '+12.3% за сегодня',
    totalSuccess: 12,
    successRate: '85.7% успешных',
    avgResponse: '1.2c',
};

const rulesMock: Rule[] = [
    {
        id: '1',
        ruleName: 'Forex Premium Rule',
        offer: 'Forex Master Pro',
        channelType: 'Звонок',
        sent: 8,
        success: 7,
        error: 1,
        lastSent: '2 мин назад',
        leads: [
            { name: 'Иван Петров', email: 'ivan@example.com', phone: '+7 999 123-45-67', successes: 4, errors: 1 },
            { name: 'Мария Сидорова', email: 'maria@example.com', phone: '+7 999 987-65-43', successes: 3, errors: 0 },
        ],
    },
    {
        id: '2',
        ruleName: 'Crypto Basic Rule',
        offer: 'Bitcoin Starter',
        channelType: 'Email',
        sent: 4,
        success: 3,
        error: 1,
        lastSent: '15 мин назад',
        leads: [
            { name: 'Олег Иванов', email: 'oleg@example.com', phone: '+7 999 555-00-11', successes: 3, errors: 1 },
        ],
    },
];

export default function AnalyticsView() {
    const [rules, setRules] = useState<Rule[]>(rulesMock);

    const toggleLeads = (id: string) => {
        setRules((prev) =>
            prev.map((r) => (r.id === id ? { ...r, leadsExpanded: !r.leadsExpanded } : r))
        );
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-lg font-semibold">Аналитика Редиректов</h2>
                <p className="text-sm text-muted-foreground">
                    Статистика отправки лидов и производительность правил
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="p-4 flex justify-between items-center">
                        <div>
                            <div className="text-sm text-muted-foreground">Всего отправлено</div>
                            <div className="text-2xl font-semibold">{analytics.totalSent}</div>
                            <div className="text-sm text-green-600 mt-1">{analytics.sentDelta}</div>
                        </div>
                        <ChevronDown className="w-8 h-8 text-blue-500 rotate-90" />
                    </Card>
                    <Card className="p-4 flex justify-between items-center">
                        <div>
                            <div className="text-sm text-muted-foreground">Успешно</div>
                            <div className="text-2xl font-semibold">{analytics.totalSuccess}</div>
                            <div className="text-sm text-green-600 mt-1">{analytics.successRate}</div>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </Card>
                    <Card className="p-4 flex justify-between items-center">
                        <div>
                            <div className="text-sm text-muted-foreground">Среднее время</div>
                            <div className="text-2xl font-semibold">{analytics.avgResponse}</div>
                            <div className="text-sm text-muted-foreground mt-1">время отклика ПП</div>
                        </div>
                        <Target className="w-8 h-8 text-muted-foreground" />
                    </Card>
                </div>
            </div>

            <div className="space-y-2">
                <h2 className="text-lg font-semibold">Производительность Правил</h2>
                <p className="text-sm text-muted-foreground">
                    Детальная статистика по каждому правилу редиректа
                </p>

                <div className="space-y-6">
                    {rules.map((rule) => {
                        const rateNum = (rule.success / rule.sent) * 100;
                        const rate = rateNum.toFixed(1);

                        return (
                            <Card key={rule.id} className="p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500" />
                                        <div className="text-sm font-medium">
                                            {rule.ruleName}
                                            <div className="text-xs text-muted-foreground">
                                                {`Оффер: ${rule.offer}`}
                                            </div>
                                        </div>
                                        <Badge variant="outline">{rate}% успешных</Badge>
                                        <Badge variant="outline">{rule.channelType}</Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                                        Последняя отправка: {rule.lastSent}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 text-sm text-center">
                                    <div>
                                        <div className="text-blue-600 font-semibold">{rule.sent}</div>
                                        Отправлено
                                    </div>
                                    <div>
                                        <div className="text-green-600 font-semibold">{rule.success}</div>
                                        Успешно
                                    </div>
                                    <div>
                                        <div className="text-red-600 font-semibold">{rule.error}</div>
                                        Ошибки
                                    </div>
                                </div>

                                <div className="mt-2 text-sm text-muted-foreground">
                                    Процент успешных отправок
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-black" style={{ width: `${rate}%` }} />
                                    </div>
                                    <div className="text-sm font-medium text-foreground">{rate}%</div>
                                </div>

                                <div
                                    className="mt-4 flex justify-between items-center cursor-pointer text-sm text-muted-foreground"
                                    onClick={() => toggleLeads(rule.id)}
                                >
                                    <span>Показать лиды ({rule.leads.length})</span>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${rule.leadsExpanded ? 'rotate-90' : ''}`} />
                                </div>

                                {rule.leadsExpanded && (
                                    <div className="mt-4 space-y-4">
                                        {rule.leads.map((lead, idx) => {
                                            const totalLeadsSent = lead.successes + lead.errors;
                                            return (
                                                <div
                                                    key={idx}
                                                    className="rounded-md border p-4 bg-muted/40 flex justify-between"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                                                            {lead.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-sm">{lead.name}</div>
                                                            <div className="text-xs text-muted-foreground">{lead.email}</div>
                                                            <div className="text-xs text-muted-foreground">{lead.phone}</div>
                                                            <div className="mt-2 text-sm">
                                                                История касаний ({rule.channelType}):
                                                                <div className="mt-1 flex items-center gap-3">
                                  <span className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="w-4 h-4" /> Успех: {lead.successes}
                                  </span>
                                                                    {lead.errors > 0 && (
                                                                        <span className="flex items-center gap-1 text-red-600">
                                      <XCircle className="w-4 h-4" /> Ошибка: {lead.errors}
                                    </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right text-sm text-muted-foreground">
                                                        <div className="font-semibold">{totalLeadsSent} отправок</div>
                                                        {lead.phone}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </div>

            <Card className="p-6">
                <h2 className="text-lg font-semibold">Динамика отправок</h2>
                <p className="text-sm text-muted-foreground">
                    График отправки лидов за последние 24 часа
                </p>
                <div className="mt-6 h-64 flex flex-col items-center justify-center">
                    <Target className="w-12 h-12 text-muted-foreground" />
                    <div className="mt-4 text-sm font-medium text-foreground">График в разработке</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                        Интерактивный график отправки лидов по времени
                    </div>
                </div>
            </Card>
        </div>
    );
}
