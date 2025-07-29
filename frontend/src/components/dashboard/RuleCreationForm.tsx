'use client';

import { FC, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, Settings, MessageSquare, Shield } from 'lucide-react';
import AllRulesView from '@/components/dashboard/AllRulesView';

const RuleCreationForm: FC = () => {
    const [type, setType] = useState('');
    const [offer, setOffer] = useState('');
    const [partner, setPartner] = useState('');
    const [status, setStatus] = useState('');
    const [period, setPeriod] = useState('');
    const [messageType, setMessageType] = useState('');
    const [template, setTemplate] = useState('');
    const [from, setFrom] = useState('5');
    const [to, setTo] = useState('15');
    const [limit, setLimit] = useState('100');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('18:00');
    const [useEmail, setUseEmail] = useState(false);
    const [usePhone, setUsePhone] = useState(false);

    return (
        <Card className="space-y-8 bg-white p-6 rounded-2xl border">
            <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-gray-900">Создание Нового Правила</h2>
                <p className="text-sm text-gray-600">Настройте фильтры и параметры отправки лидов</p>
            </div>

            <section className="space-y-4">
                <header className="flex items-center gap-2 text-lg font-medium text-gray-800">
                    <Filter className="w-5 h-5" />
                    <span>Фильтры</span>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <Label>Название правила</Label>
                        <Input
                            placeholder="Введите название правила"
                            value={type}
                            onChange={e => setType(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Тип оффера</Label>
                        <Select
                            placeholder="Выберите тип оффера"
                            value={type}
                            onChange={setType}
                            options={[
                                { label: 'Единичный оффер', value: 'single' },
                                { label: 'Групповой оффер', value: 'group' },
                            ]}
                        />
                    </div>
                    <div>
                        <Label>Единичный оффер</Label>
                        <Select
                            placeholder="Выберите оффер"
                            value={offer}
                            onChange={setOffer}
                            options={[{ label: 'VIP Forex Trading', value: '1' }]}
                        />
                    </div>
                    <div>
                        <Label>ПП (Партнёрская программа)</Label>
                        <Select
                            placeholder="Выберите ПП"
                            value={partner}
                            onChange={setPartner}
                            options={[{ label: 'Partner 1', value: 'pp1' }]}
                        />
                    </div>
                    <div>
                        <Label>Статус</Label>
                        <Select
                            placeholder="Выберите статус"
                            value={status}
                            onChange={setStatus}
                            options={[
                                { label: 'Активно', value: 'active' },
                                { label: 'Пауза', value: 'paused' },
                            ]}
                        />
                    </div>
                    <div>
                        <Label>За какой период</Label>
                        <Select
                            placeholder="Выберите период"
                            value={period}
                            onChange={setPeriod}
                            options={[
                                { label: '7 дней', value: '7' },
                                { label: '14 дней', value: '14' },
                            ]}
                        />
                    </div>
                </div>
            </section>

            <section className="pt-6 border-t border-gray-200 space-y-4">
                <header className="flex items-center gap-2 text-lg font-medium text-gray-800">
                    <Settings className="w-5 h-5" />
                    <span>Настройки Отправки</span>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label>От (мин)</Label>
                            <Input value={from} onChange={e => setFrom(e.target.value)} />
                        </div>
                        <div className="flex-1">
                            <Label>До (мин)</Label>
                            <Input value={to} onChange={e => setTo(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <Label>Количество редиректов</Label>
                        <Input
                            placeholder="Например: 100"
                            value={limit}
                            onChange={e => setLimit(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Начало периода отправки</Label>
                        <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                    </div>
                    <div>
                        <Label>Конец периода отправки</Label>
                        <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                    </div>
                    <div className="lg:col-span-3">
                        <Label>Методы отправки</Label>
                        <div className="flex items-center gap-6 mt-2">
                            <label className="flex items-center gap-2">
                                <Checkbox
                                    checked={useEmail}
                                    onChange={e => setUseEmail((e.target as HTMLInputElement).checked)}
                                />
                                <span>Email</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <Checkbox
                                    checked={usePhone}
                                    onChange={e => setUsePhone((e.target as HTMLInputElement).checked)}
                                />
                                <span>Телефон</span>
                            </label>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pt-6 border-t border-gray-200 space-y-4">
                <header className="flex items-center gap-2 text-lg font-medium text-gray-800">
                    <MessageSquare className="w-5 h-5" />
                    <span>Настройка Сообщения</span>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <Label>Тип сообщения</Label>
                        <Select
                            placeholder="Из готовых шаблонов"
                            value={messageType}
                            onChange={setMessageType}
                            options={[{ label: 'Из шаблона', value: 'template' }]}
                        />
                    </div>
                    <div>
                        <Label>Выберите шаблон</Label>
                        <Select
                            placeholder="Выберите готовое сообщение"
                            value={template}
                            onChange={setTemplate}
                            options={[{ label: 'Welcome template', value: 'welcome' }]}
                        />
                    </div>
                </div>
            </section>

            <section className="pt-6 border-t border-gray-200 space-y-4">
                <header className="flex items-center gap-2 text-lg font-medium text-gray-800">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <span>Дополнительные Настройки</span>
                </header>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm flex items-start gap-4">
                    <Shield className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    <div>
                        <div className="font-medium text-blue-700">Интеграция с Keitaro</div>
                        <p className="mt-1 text-blue-900">
                            Система автоматически учитывает объём основного трафика из Keitaro и догружает
                            лидов в соответствии с установленными лимитами.
                        </p>
                    </div>
                </div>
            </section>

            <footer className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <Button className="bg-green-600 hover:bg-green-700 text-white">Создать Правило</Button>
                <Button variant="outline">Тест Правила</Button>
            </footer>

            <AllRulesView />
        </Card>
    );
};

export default RuleCreationForm;
