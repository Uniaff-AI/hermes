import * as React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => {
    return (
        <div className={`rounded-lg border bg-white p-6 shadow-sm ${className}`} {...props} />
    );
};
