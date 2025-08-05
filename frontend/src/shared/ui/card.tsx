import * as React from 'react';

export const cn = (...inputs: (string | undefined | false)[]) => {
  return inputs.filter(Boolean).join(' ');
};

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-2xl border bg-white p-6 shadow-sm', className)}
    {...props}
  />
));
Card.displayName = 'Card';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6', className)} {...props} />
));
CardContent.displayName = 'CardContent';
