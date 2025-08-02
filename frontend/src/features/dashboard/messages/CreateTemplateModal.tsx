'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Select } from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import { UploadIcon } from '@radix-ui/react-icons';

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: TemplateFormData) => void;
}

interface TemplateFormData {
    title: string;
    category: string;
    message: string;
    isActive: boolean;
    files: File[];
}

const categoryOptions = [
    { label: 'Приветственное', value: 'Приветственное' },
    { label: 'Повторный Контакт', value: 'Повторный Контакт' },
    { label: 'Срочное предложение', value: 'Срочное предложение' },
    { label: 'Напоминание', value: 'Напоминание' },
    { label: 'Недозвон', value: 'Недозвон' },
];

const statusOptions = [
    { label: 'Активно', value: 'active' },
    { label: 'Пауза', value: 'paused' },
];

export default function CreateTemplateModal({
    open,
    onClose,
    onSubmit,
}: Props) {
    const [form, setForm] = useState<TemplateFormData>({
        title: '',
        category: categoryOptions[0].value,
        message: '',
        isActive: false,
        files: [],
    });

    const handleChange = (
        field: keyof TemplateFormData,
        value: string | boolean | File[]
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            handleChange('files', Array.from(files).slice(0, 5));
        }
    };

    const handleSubmit = () => {
        if (!form.title || !form.message) return;
        onSubmit(form);
        onClose();
        setForm({
            title: '',
            category: categoryOptions[0].value,
            message: '',
            isActive: false,
            files: [],
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-xl sm:rounded-xl sm:p-8">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Создание нового сообщения
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Создайте новый шаблон сообщения для автоматической отправки лидам
                    </p>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Название сообщения</label>
                        <Input
                            value={form.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="Введите название сообщения"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Категория</label>
                        <Select
                            options={categoryOptions}
                            value={form.category}
                            onChange={(value) => handleChange('category', value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Текст сообщения</label>
                        <Textarea
                            value={form.message}
                            onChange={(e) => handleChange('message', e.target.value)}
                            placeholder="Введите текст сообщения..."
                            rows={4}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Статус</label>
                        <Select
                            options={statusOptions}
                            value={form.isActive ? 'active' : 'paused'}
                            onChange={(value) => handleChange('isActive', value === 'active')}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Прикрепленные файлы</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center space-y-2">
                            <UploadIcon className="mx-auto h-6 w-6 text-gray-400" />
                            <p className="text-sm text-gray-500">
                                Перетащите файлы сюда или нажмите для выбора
                            </p>
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:border-0 file:bg-primary file:text-white file:px-4 file:py-2"
                                aria-label="Выберите файлы для загрузки"
                                title="Выберите файлы для загрузки"
                            />
                            <p className="text-xs text-muted-foreground">
                                Максимум 5 файлов, до 10MB каждый
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button onClick={handleSubmit}>Создать сообщение</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
