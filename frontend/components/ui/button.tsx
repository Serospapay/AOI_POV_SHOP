/**
 * Базовий компонент кнопки з High-Tech стилем
 * Уніфікований та правильний
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';
    
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/40 border border-primary/30 hover:border-primary',
      secondary: 'bg-secondary text-white hover:bg-secondary-dark hover:shadow-lg hover:shadow-secondary/40 border border-secondary/30 hover:border-secondary',
      ghost: 'bg-transparent hover:bg-white/10 text-foreground border border-transparent hover:border-white/20',
      outline: 'bg-transparent border-2 border-white/30 text-foreground hover:bg-white/10 hover:border-primary/50',
    };
    
    const sizes = {
      sm: 'h-9 px-4 text-sm min-h-[36px]',
      md: 'h-11 px-6 text-base min-h-[44px]',
      lg: 'h-12 px-8 text-lg min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        type={props.type || 'button'}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Завантаження...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
