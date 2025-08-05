'use client';

import { FC, useState, useMemo, useEffect } from 'react';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select } from '@/shared/ui/select';
import { SelectWithSearch } from '@/shared/ui/select-with-search';
import { Checkbox } from '@/shared/ui/checkbox';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Filter, Settings, MessageSquare, Shield, Loader2 } from 'lucide-react';
import AllRulesView from '@/features/rules/components/RulesManagement/AllRulesView';
import { useCreateRule } from '@/features/rules/model/hooks';
import { useProducts } from '@/features/offers/model/hooks';
import { CreateRuleRequest } from '@/features/rules/model/schemas';

const RuleCreationForm: FC = () => {
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [offer, setOffer] = useState('');
    const [offerName, setOfferName] = useState('');
    const [selectedPartner, setSelectedPartner] = useState(''); // Партнерка выбранного продукта
    const [status, setStatus] = useState('active');
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

    const createRuleMutation = useCreateRule();
    const { data: products = [] } = useProducts();

    const offerOptions = useMemo(() => {
        return products.map(product => ({
            label: product.productName,
            value: product.productId,
            description: `${product.country} • ${product.vertical} • ${product.aff}`,
            uniqueKey: `${product.productId}-${product.country}-${product.vertical}-${product.aff}`
        }));
    }, [products]);

    // Автоматически заполняем название оффера при изменении ID оффера
    useEffect(() => {
        if (offer && products.length > 0) {
            let foundProduct = products.find(product => product.productId === offer);
            if (!foundProduct) {
                foundProduct = products.find(product =>
                    product.productName.toLowerCase().includes(offer.toLowerCase())
                );
            }
            if (foundProduct) {
                setOfferName(foundProduct.productName);
                if (foundProduct.aff) {
                    setSelectedPartner(foundProduct.aff);
                }
            } else {
                setOfferName('');
                setSelectedPartner('');
            }
        }
    }, [offer, products]);

    const handleSubmit = async () => {
        if (!name.trim() || !offerName.trim() || !offer.trim()) {
            return;
        }

        const periodMinutes = period ? Math.min(parseInt(period) * 60, 1440) : 1440; // часы в минуты, макс 1440

        const ruleData: CreateRuleRequest = {
            name: name.trim(),
            offerId: offer,
            offerName: offerName.trim(),
            periodMinutes,
            minInterval: parseInt(from),
            maxInterval: parseInt(to),
            dailyLimit: parseInt(limit),
            sendWindowStart: startTime,
            sendWindowEnd: endTime,
            isActive: status === 'active',
        };

        try {
            await createRuleMutation.mutateAsync(ruleData);
            setName('');
            setType('');
            setOffer('');
            setOfferName('');
            setSelectedPartner('');
            setStatus('active');
            setPeriod('');
            setMessageType('');
            setTemplate('');
            setFrom('5');
            setTo('15');
            setLimit('100');
            setStartTime('09:00');
            setEndTime('18:00');
            setUseEmail(false);
            setUsePhone(false);
        } catch (error) {
            console.error('Ошибка при создании правила:', error);
        }
    };

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
                        <Label>Название правила *</Label>
                        <Input
                            placeholder="Введите название правила"
                            value={name}
                            onChange={e => setName(e.target.value)}
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
                        <Label>ID Оффера *</Label>
                        <SelectWithSearch
                            placeholder="Выберите или введите ID оффера"
                            options={offerOptions}
                            value={offer}
                            onChange={setOffer}
                            onLabelChange={setOfferName}
                            displayMode="value"
                        />
                    </div>
                    <div>
                        <Label>Название оффера *</Label>
                        <Input
                            placeholder="Название оффера заполнится автоматически при выборе ID"
                            value={offerName}
                            onChange={e => setOfferName(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>ПП (Партнёрская программа)</Label>
                        <Input
                            placeholder="Партнерка определится автоматически при выборе оффера"
                            value={selectedPartner}
                            readOnly
                            className="bg-gray-50"
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
                        <Label>За какой период (часы)</Label>
                        <Select
                            placeholder="Выберите период"
                            value={period}
                            onChange={setPeriod}
                            options={[
                                { label: '1 час', value: '1' },
                                { label: '6 часов', value: '6' },
                                { label: '12 часов', value: '12' },
                                { label: '24 часа (1 день)', value: '24' },
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
                            <Input
                                type="number"
                                value={from}
                                onChange={e => setFrom(e.target.value)}
                                min="0"
                            />
                        </div>
                        <div className="flex-1">
                            <Label>До (мин)</Label>
                            <Input
                                type="number"
                                value={to}
                                onChange={e => setTo(e.target.value)}
                                min="0"
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Количество редиректов</Label>
                        <Input
                            type="number"
                            placeholder="Например: 100"
                            value={limit}
                            onChange={e => setLimit(e.target.value)}
                            min="1"
                            max="10000"
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
                <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleSubmit}
                    disabled={createRuleMutation.isPending}
                >
                    {createRuleMutation.isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Создание...
                        </>
                    ) : (
                        'Создать Правило'
                    )}
                </Button>
                <Button variant="outline">Тест Правила</Button>
            </footer>

            <AllRulesView />
        </Card>
    );
};

export default RuleCreationForm;
