'use client';

import {
ActivitySquare, BarChart,
BookOpenCheck, ClipboardList, DollarSign, Eye,     Home,     Layers, Settings, Terminal,
Users} from 'lucide-react';

const menuItems = [
    { label: 'Дашборд', icon: <Home className="w-4 h-4" />, href: '/' },
    { label: 'Менеджмент лидов', icon: <Users className="w-4 h-4" />, href: '/leads' },
    { label: 'Tracking', icon: <ActivitySquare className="w-4 h-4" />, href: '/tracking' },
    { label: 'Task Tracking', icon: <ClipboardList className="w-4 h-4" />, href: '/tasks' },
    { label: 'Лиды', icon: <BarChart className="w-4 h-4" />, href: '/leads-table' },
    { label: 'Креативы', icon: <Layers className="w-4 h-4" />, href: '/creatives' },
    { label: 'Офферы', icon: <DollarSign className="w-4 h-4" />, href: '/offers' },
    { label: 'Финансы', icon: <BookOpenCheck className="w-4 h-4" />, href: '/finance' },
    { label: 'ПП', icon: <Users className="w-4 h-4" />, href: '/partners' },
    { label: 'Пользователи', icon: <Users className="w-4 h-4" />, href: '/users' },
    { label: 'Время просмотра', icon: <Eye className="w-4 h-4" />, href: '/watch-time' },
    { label: 'Стата кнопок', icon: <Terminal className="w-4 h-4" />, href: '/cta' },
];

export default function Sidebar() {
    return (
        <aside className="h-screen w-64 bg-white border-r p-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold">Hermes</h1>
                <Settings className="w-5 h-5 text-gray-500" />
            </div>

            <p className="text-xs text-gray-500 mb-2 px-2 uppercase">Навигация</p>

            <nav className="flex flex-col space-y-2">
                {menuItems.map((item, idx) => (
                    <a
                        key={idx}
                        href={item.href}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-md transition"
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </a>
                ))}
            </nav>
        </aside>
    );
}
