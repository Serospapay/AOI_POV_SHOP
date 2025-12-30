/**
 * TypeScript типи для товарів
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  capacity?: number; // мАг
  power?: number; // Вт
  battery_type?: string; // Li-Ion, Li-Po, etc
  brand?: string;
  category?: string;
  weight?: number;
  dimensions?: string;
  stock: number;
  is_active: boolean;
  rating: number; // Середній рейтинг (0-5)
  rating_count: number; // Кількість оцінок
  created_at: string;
  updated_at: string;
  charge_cycles?: number; // Для калькулятора
  estimated_charge_time?: number; // Для калькулятора
}

export interface ProductFilters {
  capacity_min?: number;
  capacity_max?: number;
  power_min?: number;
  power_max?: number;
  battery_type?: string;
  price_min?: number;
  price_max?: number;
  brand?: string;
  category?: string;
}

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total?: number;
  total_items?: number;
  pages?: number;
  total_pages?: number;
  has_next?: boolean;
  has_prev?: boolean;
  items?: T[];
  data?: T[];
}

