'use client';

import {FC, useState} from 'react';

import RedirectRulesView from "@/components/dashboard/RedirectRuleCard";
import RuleCreationForm from "@/components/dashboard/RuleCreationForm";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {TemplatesView} from "@/components/dashboard/messages/TemplatesView";

const RedirectsView: FC = () => {
    const [subTab, setSubTab] = useState('active');

    const subTabs = [
        { value: 'active', label: 'Активные правила' },
        { value: 'management', label: 'Менеджмент правил' },
        { value: 'messages', label: 'Готовые сообщения' },
        { value: 'analytics', label: 'Аналитика' },
    ];

    return (
        <div className="bg-[#F9FAFB] min-h-screen py-6 px-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Управление редиректами</h1>
            <p className="text-sm text-gray-500 mb-6">
                Настройка правил перенаправления и отправки лидов
            </p>

            <Tabs value={subTab} onValueChange={setSubTab}>
                <TabsList className="w-full grid grid-cols-4 bg-[#F2F4F7] p-1 rounded-md">
                    {subTabs.map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="w-full px-4 py-2 text-sm font-medium text-center rounded-md
                data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900
                text-gray-600"
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <div className="mt-6">
                {subTab === 'active' && <RedirectRulesView/>}
                {subTab === 'management' && <div>⚙️<RuleCreationForm/></div>}
                {subTab === 'messages' && <div> <TemplatesView/></div>}
                {subTab === 'analytics' && <div>📊 Аналитика по редиректам</div>}
            </div>
        </div>
    );
};

export default RedirectsView;