import React, { FC, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'success' | 'danger';

interface BadgeProps {
    children: ReactNode;
    className?: string;
    variant?: BadgeVariant;
}

export const Badge: FC<BadgeProps> = ({ children, className, variant = 'default' }) => {
    const baseStyle = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
    const variantStyles: Record<BadgeVariant, string> = {
        default: 'bg-gray-100 text-gray-800',
        secondary: 'bg-gray-200 text-gray-700',
        success: 'bg-green-100 text-green-800',
        danger: 'bg-red-100 text-red-800',
    };

    return (
        <span className={cn(baseStyle, variantStyles[variant], className)}>
      {children}
    </span>
    );
};
