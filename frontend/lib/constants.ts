/**
 * Константи для frontend
 */

// Для серверного рендерингу використовуємо ім'я сервісу Docker, для клієнта - localhost
// Це значення використовується тільки для типів, реальний URL визначається в api.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const API_V1_BASE = '/api/v1';

// API endpoints (без базового URL, він додається в api.ts)
export const API_ENDPOINTS = {
  auth: {
    login: `${API_V1_BASE}/auth/login`,
    register: `${API_V1_BASE}/auth/register`,
    refresh: `${API_V1_BASE}/auth/refresh`,
  },
  products: {
    list: `${API_V1_BASE}/products`,
    detail: (id: string) => `${API_V1_BASE}/products/${id}`,
  },
  search: {
    products: `${API_V1_BASE}/search/products`,
  },
  orders: {
    create: `${API_V1_BASE}/orders`,
    my: `${API_V1_BASE}/orders/my`,
    detail: (id: string) => `${API_V1_BASE}/orders/${id}`,
    adminAll: `${API_V1_BASE}/orders/admin/all`,
  },
  admin: {
    stats: `${API_V1_BASE}/admin/stats`,
    updateOrderStatus: (id: string) => `${API_V1_BASE}/admin/orders/${id}/status`,
    updatePaymentStatus: (id: string) => `${API_V1_BASE}/admin/orders/${id}/payment-status`,
    pendingReviews: `${API_V1_BASE}/reviews/admin/pending`,
    moderateReview: (id: string) => `${API_V1_BASE}/reviews/admin/${id}/moderate`,
    deleteReview: (id: string) => `${API_V1_BASE}/reviews/admin/${id}`,
  },
  reviews: {
    getByProduct: (productId: string) => `${API_V1_BASE}/reviews/product/${productId}`,
    create: (productId: string) => `${API_V1_BASE}/reviews/product/${productId}`,
    update: (id: string) => `${API_V1_BASE}/reviews/${id}`,
    delete: (id: string) => `${API_V1_BASE}/reviews/${id}`,
  },
  calculator: {
    powerBank: `${API_V1_BASE}/calculator/power-bank`,
    ups: `${API_V1_BASE}/calculator/ups`,
  },
} as const;

