/**
 * Базовий компонент input з High-Tech стилем
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2 text-foreground">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'w-full h-11 px-3 bg-white/5 border border-white/10 rounded-lg',
            'text-foreground placeholder:text-gray-500 text-base',
            'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60',
            'transition-all duration-200',
            error && 'border-red-500/60 focus:ring-red-500/40',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

