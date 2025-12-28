/**
 * Dashboard адмін панелі
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { get } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface AdminStats {
  orders: {
    total: number;
    by_status: Record<string, number>;
    paid: number;
    pending: number;
  };
  revenue: {
    total: number;
    paid: number;
    pending: number;
  };
  products: {
    total: number;
    active: number;
    low_stock: number;
  };
  users: {
    total: number;
    admins: number;
  };
  recent_orders: Array<{
    id: string;
    order_status: string;
    payment_status: string;
    total_amount: number;
    created_at: string;
    email: string;
  }>;
}

const statusLabels: Record<string, string> = {
  new: 'Нові',
  processing: 'Обробляються',
  shipped: 'Відправлені',
  delivered: 'Доставлені',
  cancelled: 'Скасовані',
};

const statusColors: Record<string, string> = {
  new: 'text-blue-400',
  processing: 'text-yellow-400',
  shipped: 'text-purple-400',
  delivered: 'text-green-400',
  cancelled: 'text-red-400',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    // Оновлюємо статистику кожні 30 секунд
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await get<AdminStats>(API_ENDPOINTS.admin.stats);
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Помилка завантаження статистики');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-96 bg-glass rounded-xl animate-pulse border-2 border-white/10" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <Card variant="glass" className="border-2 border-red-500/50">
            <CardContent className="pt-6 text-center">
              <p className="text-red-400 mb-4">{error || 'Не вдалося завантажити статистику'}</p>
              <button
                onClick={loadStats}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
              >
                Спробувати знову
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-gray-400">Огляд статистики та активності</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Замовлення */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass" className="border-2 border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-gray-400">Замовлення</span>
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stats.orders.total}</p>
                <p className="text-sm text-gray-500 mt-1">Всього замовлень</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Виручка */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass" className="border-2 border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-gray-400">Виручка</span>
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-400">{formatPrice(stats.revenue.paid)}</p>
                <p className="text-sm text-gray-500 mt-1">Оплачено з {formatPrice(stats.revenue.total)}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Товари */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="glass" className="border-2 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-gray-400">Товари</span>
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stats.products.active}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Активних з {stats.products.total}
                  {stats.products.low_stock > 0 && (
                    <span className="text-red-400 ml-1">({stats.products.low_stock} з низьким залишком)</span>
                  )}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Користувачі */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="glass" className="border-2 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-gray-400">Користувачі</span>
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stats.users.total}</p>
                <p className="text-sm text-gray-500 mt-1">Користувачів ({stats.users.admins} адмінів)</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Orders by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="glass" className="border-2">
            <CardHeader>
              <CardTitle>Замовлення за статусами</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(stats.orders.by_status).map(([status, count]) => (
                  <div key={status} className="text-center p-4 bg-background-light rounded-lg border border-white/10">
                    <p className={`text-2xl font-bold ${statusColors[status] || 'text-foreground'}`}>{count}</p>
                    <p className="text-sm text-gray-400 mt-1">{statusLabels[status] || status}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card variant="glass" className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Останні замовлення</span>
                <Link href="/admin/orders">
                  <button className="text-sm text-primary hover:text-primary/80">Всі замовлення →</button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recent_orders.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Немає замовлень</p>
                ) : (
                  stats.recent_orders.map((order) => (
                    <Link key={order.id} href={`/admin/orders/${order.id}`}>
                      <div className="flex items-center justify-between p-4 bg-background-light rounded-lg border border-white/10 hover:border-primary/30 transition-all cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-foreground">#{order.id.slice(-8).toUpperCase()}</span>
                            <span className={`text-xs px-2 py-1 rounded ${statusColors[order.order_status] || 'text-gray-400'} bg-white/5`}>
                              {statusLabels[order.order_status] || order.order_status}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              order.payment_status === 'paid' ? 'text-green-400' : 'text-yellow-400'
                            } bg-white/5`}>
                              {order.payment_status === 'paid' ? 'Оплачено' : 'Очікує оплати'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{order.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{formatPrice(order.total_amount)}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('uk-UA')}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

