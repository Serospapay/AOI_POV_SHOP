/**
 * Hook для пошуку товарів
 */

import { useState, useEffect, useCallback } from 'react';
import { get } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Product } from '@/types/product';

export function useSearch(query: string, limit = 20) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await get<Product[]>(
        `${API_ENDPOINTS.search.products}?q=${encodeURIComponent(searchQuery)}&limit=${limit}`
      );

      setResults(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка пошуку');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      search(query);
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [query, search]);

  return { results, loading, error, search };
}

