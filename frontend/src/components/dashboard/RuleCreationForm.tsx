'use client';

import { FC, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const RuleCreationForm: FC = () => {
    const [type, setType] = useState('');
    const [offer, setOffer] = useState('');
    const [partner, setPartner] = useState('');
    const [status, setStatus] = useState('');
    const [period, setPeriod] = useState('');
    const [messageType, setMessageType] = useState('');
    const [template, setTemplate] = useState('');

    return (
        <form className="space-y-10">
            <div className="space-y-1">
                <h2 className="text-2xl font-bold">Создание Нового Правила</h2>
                <p className="text-muted-foreground text-sm">
                    Настройте фильтры и параметры отправки лидов
                </p>
            </div>

            <div className="space-y-6">
                <h3 className="font-semibold text-lg">🔍 Фильтры</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label>Название правила</Label>
                        <Input placeholder="Введите название правила" />
                    </div>
                    <div>
                        <Label>Тип оффера</Label>
                        <Select
                            placeholder="Выберите тип"
                            options={[
                                { label: 'Единичный оффер', value: 'single' },
                                { label: 'Групповой оффер', value: 'group' },
                            ]}
                            value={type}
                            onChange={setType}
                        />
                    </div>
                    <div>
                        <Label>Единичный оффер</Label>
                        <Select
                            placeholder="Выберите оффер"
                            options={[{ label: 'VIP Forex Trading', value: '1' }]}
                            value={offer}
                            onChange={setOffer}
                        />
                    </div>
                    <div>
                        <Label>ПП (Партнёрская программа)</Label>
                        <Select
                            placeholder="Выберите ПП"
                            options={[{ label: 'Partner 1', value: 'pp1' }]}
                            value={partner}
                            onChange={setPartner}
                        />
                    </div>
                    <div>
                        <Label>Статус</Label>
                        <Select
                            placeholder="Выберите статус"
                            options={[
                                { label: 'Активно', value: 'active' },
                                { label: 'Пауза', value: 'paused' },
                            ]}
                            value={status}
                            onChange={setStatus}
                        />
                    </div>
                    <div>
                        <Label>За какой период</Label>
                        <Select
                            placeholder="Выберите период"
                            options={[
                                { label: '7 дней', value: '7' },
                                { label: '14 дней', value: '14' },
                            ]}
                            value={period}
                            onChange={setPeriod}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="font-semibold text-lg">⚙️ Настройки Отправки</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label>От</Label>
                            <Input placeholder="5" defaultValue="5" />
                        </div>
                        <div className="flex-1">
                            <Label>До</Label>
                            <Input placeholder="15" defaultValue="15" />
                        </div>
                    </div>
                    <div>
                        <Label>Количество редиректов</Label>
                        <Input placeholder="Например: 100" defaultValue="100" />
                    </div>
                    <div>
                        <Label>Начало периода отправки</Label>
                        <Input type="time" defaultValue="09:00" />
                    </div>
                    <div>
                        <Label>Конец периода отправки</Label>
                        <Input type="time" defaultValue="18:00" />
                    </div>
                    <div className="col-span-2">
                        <Label>Методы отправки</Label>
                        <div className="flex items-center gap-6 mt-2">
                            <div className="flex items-center gap-2">
                                <Checkbox id="email" />
                                <Label htmlFor="email">Email</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="phone" />
                                <Label htmlFor="phone">Телефон</Label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="font-semibold text-lg">💬 Настройка Сообщения</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <Label>Тип сообщения</Label>
                        <Select
                            placeholder="Из готовых шаблонов"
                            options={[{ label: 'Из шаблона', value: 'template' }]}
                            value={messageType}
                            onChange={setMessageType}
                        />
                    </div>
                    <div>
                        <Label>Выберите шаблон</Label>
                        <Select
                            placeholder="Выберите готовое сообщение"
                            options={[{ label: 'Welcome template', value: 'welcome' }]}
                            value={template}
                            onChange={setTemplate}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-lg">⚙️ Дополнительные Настройки</h3>
                <Card className="p-4 bg-blue-50 border border-blue-200 text-sm">
                    <b>Интеграция с Keitaro</b>
                    <p className="text-blue-900 mt-1">
                        Система автоматически учитывает объём основного трафика из Keitaro и догружает лидов в
                        соответствии с установленными лимитами.
                    </p>
                </Card>
            </div>

            <div className="flex gap-4 mt-6">
                <Button type="submit">Создать Правило</Button>
                <Button type="button" variant="outline">
                    Тест Правила
                </Button>
            </div>
        </form>
    );
};

export default RuleCreationForm;
