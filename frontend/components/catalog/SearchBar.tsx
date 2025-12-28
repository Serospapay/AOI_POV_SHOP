/**
 * Компонент пошуку товарів - виправлена версія
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  compact?: boolean;
}

export function SearchBar({ onSearch, placeholder = 'Пошук товарів...', compact = false }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const inputHeight = compact ? 'h-9' : 'h-11';
  const textSize = compact ? 'text-sm' : 'text-base';

  return (
    <form onSubmit={handleSubmit} className={compact ? 'w-full' : 'w-full max-w-2xl mx-auto'}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className={`w-full ${inputHeight} pl-10 ${query ? 'pr-9' : 'pr-3'} ${textSize} bg-white/5 border border-white/10 rounded-lg text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all`}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className={`absolute right-2 top-1/2 -translate-y-1/2 ${compact ? 'p-0.5' : 'p-1'} rounded hover:bg-white/10 transition-colors`}
              aria-label="Очистити"
            >
              <svg className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <Button
          type="submit"
          variant="primary"
          size={compact ? 'sm' : 'md'}
          className={compact ? 'px-3' : 'px-5'}
        >
          <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} ${!compact ? 'mr-1.5' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {!compact && <span>Пошук</span>}
        </Button>
      </div>
    </form>
  );
}
