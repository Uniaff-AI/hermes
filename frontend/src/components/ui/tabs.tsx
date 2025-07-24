'use client';

import React from 'react';

import { cn } from '@/lib/utils';

// === Типы пропсов ===
type TabsProps = {
    value: string;
    onValueChange: (value: string) => void;
    className?: string;
    children: React.ReactNode;
};

type TabsListProps = {
    className?: string;
    children: React.ReactNode;
    selectedValue?: string;
    onSelect?: (value: string) => void;
};

type TabsTriggerProps = {
    value: string;
    children: React.ReactNode;
    selectedValue?: string;
    onSelect?: (value: string) => void;
    className?: string;
};

// ===== Tabs =====
export const Tabs = ({
                         value,
                         onValueChange,
                         className,
                         children,
                     }: TabsProps) => {
    return (
        <div className={cn('w-full', className)}>
            {React.Children.map(children, (child): React.ReactNode => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                        selectedValue: value,
                        onSelect: onValueChange,
                    } as Partial<TabsListProps>);
                }
                return child;
            })}
        </div>
    );
};

// ===== TabsList =====
export const TabsList = ({
                             className,
                             children,
                             selectedValue,
                             onSelect,
                         }: TabsListProps) => {
    return (
        <div className={cn('flex space-x-2', className)}>
            {React.Children.map(children, (child): React.ReactNode => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                        selectedValue,
                        onSelect,
                    } as Partial<TabsTriggerProps>);
                }
                return child;
            })}
        </div>
    );
};

// ===== TabsTrigger =====
export const TabsTrigger = ({
                                value,
                                children,
                                selectedValue,
                                onSelect,
                                className,
                            }: TabsTriggerProps) => {
    const isActive = selectedValue === value;

    return (
        <button
            type="button"
            onClick={() => onSelect?.(value)}
            className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition',
                isActive
                    ? 'bg-white shadow text-gray-900 border border-gray-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
                className
            )}
        >
            {children}
        </button>
    );
};
