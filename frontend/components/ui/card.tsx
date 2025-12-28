/**
 * Базовий компонент картки з Glassmorphism ефектом
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'glass-strong';
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', hover = true, children, ...props }, ref) => {
    const variants = {
      default: 'bg-background-light border border-gray-800',
      glass: 'glass',
      'glass-strong': 'glass-strong',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl p-6 border',
          variants[variant],
          hover && 'transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20 border-white/10 hover:border-primary/30',
          !hover && 'border-white/10',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-xl font-bold text-foreground', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-gray-300', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

