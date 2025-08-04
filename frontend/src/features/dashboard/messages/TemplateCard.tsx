'use client'

import { FC } from 'react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/lib/utils'
import { Pencil, Trash2, Power, Copy } from 'lucide-react'
import { MessageCircle } from 'lucide-react'

export interface TemplateData {
    title: string
    category: string
    message: string
    isActive: boolean
}

interface TemplateCardProps {
    data: TemplateData
    onToggle: () => void
    onEdit: () => void
    onCopy: () => void
    onDelete: () => void
}

const Badge: FC<{ active: boolean }> = ({ active }) => {
    const label = active ? 'Активно' : 'Пауза'
    const bgColor = active ? 'bg-green-100' : 'bg-gray-200'
    const textColor = active ? 'text-green-800' : 'text-gray-800'

    return (
        <span
            className={cn(
                'ml-2 inline-block rounded-full px-3 py-0.5 text-xs font-medium',
                bgColor,
                textColor
            )}
        >
            {label}
        </span>
    )
}

const TemplateCard: FC<TemplateCardProps> = ({
    data,
    onToggle,
    onEdit,
    onCopy,
    onDelete
}) => {
    return (
        <div className="rounded-lg border p-5 space-y-4 bg-white shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                    <MessageCircle className="w-5 h-5 text-black" />
                    {data.title}
                    <Badge active={data.isActive} />
                </div>
                <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" onClick={onToggle}>
                        <Power className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={onEdit}>
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={onCopy}>
                        <Copy className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={onDelete}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            </div>

            <div>
                <div className="text-sm text-muted-foreground mb-1">Категория</div>
                <span className="inline-block rounded-full bg-muted px-3 py-0.5 text-xs text-muted-foreground">
                    {data.category}
                </span>
            </div>

            <div>
                <div className="text-sm text-muted-foreground mb-1">Текст сообщения</div>
                <div className="rounded border px-3 py-2 text-sm">{data.message}</div>
            </div>
        </div>
    )
}

export default TemplateCard
