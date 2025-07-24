import * as React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'secondary';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        const baseStyle = 'inline-flex items-center px-4 py-2 border text-sm font-medium rounded';
        const variants = {
            default: 'bg-blue-600 text-white hover:bg-blue-700',
            secondary: 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200',
        };
        return (
            <button
                ref={ref}
                className={`${baseStyle} ${variants[variant]} ${className}`}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';
