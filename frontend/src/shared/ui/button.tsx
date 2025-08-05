import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'link';
    size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, children, variant = 'default', size = 'md', ...props }, ref) => {
        const base =
            'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

        const variants = {
            default: 'bg-blue-600 text-white hover:bg-blue-700',
            outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-100',
            ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
            destructive: 'bg-red-600 text-white hover:bg-red-700',
            link: 'text-blue-600 hover:underline p-0 h-auto',
        };

        const sizes = {
            sm: 'text-sm px-3 py-1.5',
            md: 'text-sm px-4 py-2',
            lg: 'text-base px-5 py-2.5',
            icon: 'p-2 w-8 h-8',
        };

        return (
            <button
                ref={ref}
                className={cn(base, variants[variant], sizes[size] ?? '', className)}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
