/**
 * Кастомний компонент select з High-Tech стилем та темною темою
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ className, label, error, options, value, onChange, disabled, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    const selectedOption = options.find((opt) => opt.value === value);

    const handleSelect = (optionValue: string) => {
      if (disabled) return;
      
      // Створюємо синтетичну подію для onChange
      const syntheticEvent = {
        target: { value: optionValue },
      } as React.ChangeEvent<HTMLSelectElement>;
      
      onChange(syntheticEvent);
      setIsOpen(false);
    };

    return (
      <div ref={containerRef} className="w-full relative">
        {label && (
          <label className="block text-sm font-medium mb-2 text-foreground">
            {label}
          </label>
        )}
        <div
          ref={ref || selectRef}
          className={cn(
            'w-full h-11 px-3 bg-white/5 border border-white/10 rounded-lg',
            'text-foreground text-base',
            'focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/60',
            'transition-all duration-200',
            'cursor-pointer flex items-center justify-between',
            disabled && 'opacity-50 cursor-not-allowed',
            error && 'border-red-500/60 focus-within:ring-red-500/40',
            className
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          {...props}
        >
          <span className={cn(
            'flex-1 truncate',
            !selectedOption && 'text-gray-500'
          )}>
            {selectedOption?.label || 'Оберіть опцію'}
          </span>
          <svg
            className={cn(
              'w-5 h-5 text-primary transition-transform flex-shrink-0 ml-2',
              isOpen && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-background-light border-2 border-white/20 rounded-lg shadow-xl overflow-hidden backdrop-blur-xl">
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'px-4 py-3 cursor-pointer transition-all',
                    'hover:bg-primary/20 hover:text-primary',
                    value === option.value && 'bg-primary/30 text-primary font-semibold',
                    value !== option.value && 'text-foreground'
                  )}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
