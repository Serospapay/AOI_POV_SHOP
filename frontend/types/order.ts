/**
 * TypeScript типи для замовлень
 */

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface OrderAddress {
  street: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  items: OrderItem[];
  address: OrderAddress;
  email: string;
  notes?: string;
  payment_method: string;
  delivery_method: string;
  payment_status: string;
  order_status: string;
  items_total: number;
  delivery_cost: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  user_id?: string; // Опціонально - бекенд встановить з токена, якщо авторизований
  items: OrderItem[];
  address: OrderAddress;
  email: string;
  notes?: string;
  payment_method?: string;
  delivery_method?: string;
  payment_status?: string;
  order_status?: string;
}

