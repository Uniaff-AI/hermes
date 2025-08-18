'use client';

import { useState } from 'react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Select } from '@/shared/ui/select';
import { CreateCategoryModal } from '@/features/dashboard/components/Messages/CreateCategoryModal';
import CreateTemplateModal from '@/features/dashboard/components/Messages/CreateTemplateModal';
import EditTemplateModal from '@/features/dashboard/components/Messages/EditTemplateModal';
import TemplateCard, { TemplateData } from '@/features/dashboard/components/Messages/TemplateCard';

const categoryOptions = [
  { label: 'Все категории', value: 'all' },
  { label: 'Приветственное', value: 'Приветственное' },
  { label: 'Повторный контакт', value: 'Повторный Контакт' },
  { label: 'Срочное предложение', value: 'Срочное предложение' },
  { label: 'Напоминание', value: 'Напоминание' },
  { label: 'Недозвон', value: 'Недозвон' },
];

const statusOptions = [
  { label: 'Все', value: 'all' },
  { label: 'Активные', value: 'active' },
  { label: 'Пауза', value: 'paused' },
];

const initialTemplates: TemplateData[] = [
  {
    title: 'Приветственное сообщение',
    category: 'Приветственное',
    message:
      'Здравствуйте! Спасибо за интерес к нашему предложению. Наш менеджер свяжется с вами в ближайшее время.',
    isActive: true,
  },
  {
    title: 'Повторный контакт',
    category: 'Повторный Контакт',
    message:
      'Добрый день! Мы пытались связаться с вами ранее. Есть выгодное предложение специально для вас.',
    isActive: true,
  },
  {
    title: 'Срочное предложение',
    category: 'Срочное предложение',
    message:
      '🔥 Только сегодня! Получите скидку 30% при заказе в течение часа.',
    isActive: false,
  },
  {
    title: 'Напоминание о заявке',
    category: 'Напоминание',
    message:
      'Вы оставляли заявку на нашем сайте. Мы готовы проконсультировать вас по всем вопросам.',
    isActive: false,
  },
  {
    title: 'Недозвон',
    category: 'Недозвон',
    message:
      'Мы пытались дозвониться вам, но не удалось. Напишите нам в ответ или ждите нового звонка.',
    isActive: false,
  },
];

export const TemplatesView = () => {
  const [category, setCategory] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [templates, setTemplates] = useState<TemplateData[]>(initialTemplates);
  const [isCreateCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [isCreateTemplateOpen, setCreateTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateData | null>(
    null
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setTemplates((prev) =>
      prev.map((tpl, idx) =>
        idx === index ? { ...tpl, isActive: !tpl.isActive } : tpl
      )
    );
  };

  const handleEdit = (index: number, updated: TemplateData) => {
    setTemplates((prev) =>
      prev.map((tpl, idx) => (idx === index ? updated : tpl))
    );
  };

  const handleCopy = (index: number) => {
    const copied = {
      ...templates[index],
      title: templates[index].title + ' (копия)',
    };
    setTemplates((prev) => [...prev, copied]);
  };

  const handleDelete = (index: number) => {
    setTemplates((prev) => prev.filter((_, idx) => idx !== index));
  };

  const filteredTemplates = Array.isArray(templates) ? templates.filter((t) => {
    const byCategory = category === 'all' || t.category === category;
    const byStatus =
      status === 'all' ||
      (status === 'active' && t.isActive) ||
      (status === 'paused' && !t.isActive);
    return byCategory && byStatus;
  }) : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Готовые сообщения</h2>
        <p className="text-sm text-muted-foreground">
          Управление шаблонами сообщений для автоматической отправки
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 gap-4">
          <Input
            placeholder="Поиск по названию или содержимому..."
            className="w-full"
          />
          <Select
            value={category}
            onChange={setCategory}
            options={categoryOptions}
            placeholder="Категория"
          />
          <Select
            value={status}
            onChange={setStatus}
            options={statusOptions}
            placeholder="Статус"
          />
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 rounded-md px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all"
            style={{
              background: 'linear-gradient(90deg, #D946EF 0%, #EC4899 100%)',
            }}
            onClick={() => setCreateCategoryOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="white"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
              />
            </svg>
            Создать категорию
          </button>

          <button
            className="flex items-center gap-2 rounded-md px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all"
            style={{
              background: 'linear-gradient(90deg, #3B82F6 0%, #6366F1 100%)',
            }}
            onClick={() => setCreateTemplateOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="white"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Создать сообщение
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTemplates.map((template, idx) => (
          <TemplateCard
            key={idx}
            data={template}
            onToggle={() => handleToggle(idx)}
            onEdit={() => {
              setEditingTemplate(template);
              setEditingIndex(idx);
            }}
            onCopy={() => handleCopy(idx)}
            onDelete={() => handleDelete(idx)}
          />
        ))}
      </div>

      <CreateCategoryModal
        open={isCreateCategoryOpen}
        onClose={() => setCreateCategoryOpen(false)}
        onSubmit={() => { }}
      />

      <CreateTemplateModal
        open={isCreateTemplateOpen}
        onClose={() => setCreateTemplateOpen(false)}
        onSubmit={(template: TemplateData) => {
          setTemplates((prev) => [...prev, template]);
        }}
      />

      {editingTemplate && editingIndex !== null && (
        <EditTemplateModal
          open={!!editingTemplate}
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSubmit={(updated) => {
            if (editingIndex !== null) {
              handleEdit(editingIndex, updated);
            }
            setEditingTemplate(null);
            setEditingIndex(null);
          }}
        />
      )}
    </div>
  );
};
