'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'
import { Select } from '@/shared/ui/select'

interface TemplateData {
    title: string
    category: string
    message: string
    isActive: boolean
}

interface EditTemplateModalProps {
    open: boolean
    template: TemplateData
    onClose: () => void
    onSubmit: (updated: TemplateData) => void
}

const categories = [
    { label: 'Приветственное', value: 'Приветственное' },
    { label: 'Повторный Контакт', value: 'Повторный Контакт' },
    { label: 'Срочное предложение', value: 'Срочное предложение' },
    { label: 'Напоминание', value: 'Напоминание' },
    { label: 'Недозвон', value: 'Недозвон' }
]

const statuses = [
    { label: 'Активно', value: 'true' },
    { label: 'Пауза', value: 'false' }
]

const EditTemplateModal = ({ open, template, onClose, onSubmit }: EditTemplateModalProps) => {
    const [formData, setFormData] = useState<TemplateData>(template)

    const handleChange = (key: keyof TemplateData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Редактировать сообщение</DialogTitle>
                </DialogHeader>

                <Input
                    placeholder="Название сообщения"
                    value={formData.title}
                    onChange={e => handleChange('title', e.target.value)}
                />

                <Select
                    value={formData.category}
                    onChange={val => handleChange('category', val)}
                    options={categories}
                    placeholder="Категория"
                />

                <Textarea
                    placeholder="Введите текст сообщения..."
                    value={formData.message}
                    onChange={e => handleChange('message', e.target.value)}
                />

                <Select
                    value={formData.isActive.toString()}
                    onChange={val => handleChange('isActive', val === 'true')}
                    options={statuses}
                    placeholder="Статус"
                />

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Отмена</Button>
                    <Button onClick={() => onSubmit(formData)}>Сохранить</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default EditTemplateModal
