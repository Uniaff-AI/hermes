import { FC } from 'react'

type Status = 'active' | 'paused'

interface StatusBadgeProps {
    status: Status
}

const statusMap: Record<Status, { label: string; bg: string; text: string }> = {
    active: {
        label: 'Активно',
        bg: 'bg-green-100',
        text: 'text-green-800',
    },
    paused: {
        label: 'Пауза',
        bg: 'bg-gray-200',
        text: 'text-gray-800',
    },
}

export const StatusBadge: FC<StatusBadgeProps> = ({ status }) => {
    const { label, bg, text } = statusMap[status]

    return (
        <span
            className={`ml-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${bg} ${text}`}
        >
      {label}
    </span>
    )
}
