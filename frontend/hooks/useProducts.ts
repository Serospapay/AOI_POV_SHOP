/**
 * Hook для роботи з товарами
 */

import { useState, useEffect } from 'react';
import { get } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Product, ProductFilters, PaginatedResponse } from '@/types/product';

interface UseProductsParams {
  filters?: ProductFilters;
  page?: number;
  limit?: number;
}

export function useProducts({ filters, page = 1, limit = 20 }: UseProductsParams = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Формуємо query параметри
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        if (filters) {
          if (filters.capacity_min !== undefined) params.append('capacity_min', filters.capacity_min.toString());
          if (filters.capacity_max !== undefined) params.append('capacity_max', filters.capacity_max.toString());
          if (filters.power_min !== undefined) params.append('power_min', filters.power_min.toString());
          if (filters.power_max !== undefined) params.append('power_max', filters.power_max.toString());
          if (filters.battery_type) params.append('battery_type', filters.battery_type);
          if (filters.price_min !== undefined) params.append('price_min', filters.price_min.toString());
          if (filters.price_max !== undefined) params.append('price_max', filters.price_max.toString());
          if (filters.brand) params.append('brand', filters.brand);
          if (filters.category) params.append('category', filters.category);
        }

        const response = await get<PaginatedResponse<Product>>(
          `${API_ENDPOINTS.products.list}?${params.toString()}`
        );

        // Бекенд повертає items
        const productsList = response.items || [];
        const totalItems = response.total || 0;
        const totalPages = response.pages || 0;
        
        setProducts(productsList);
        setPagination({
          page: response.page,
          limit: response.limit,
          total: totalItems,
          pages: totalPages,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Помилка завантаження товарів';
        setError(errorMessage);
        console.error('Помилка завантаження товарів:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, page, limit]);

  return { products, loading, error, pagination };
}

