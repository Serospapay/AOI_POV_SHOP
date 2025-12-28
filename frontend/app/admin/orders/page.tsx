/**
 * Сторінка управління замовленнями
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { get, put } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Order {
  id: string;
  order_status: string;
  payment_status: string;
  total_amount: number;
  items_total: number;
  delivery_cost: number;
  created_at: string;
  email: string;
  address: {
    street: string;
    city: string;
    postal_code: string;
    phone: string;
  };
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

const ORDER_STATUSES = [
  { value: 'new', label: 'Нове' },
  { value: 'processing', label: 'Обробляється' },
  { value: 'shipped', label: 'Відправлено' },
  { value: 'delivered', label: 'Доставлено' },
  { value: 'cancelled', label: 'Скасовано' },
];

const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Очікує оплати' },
  { value: 'paid', label: 'Оплачено' },
  { value: 'failed', label: 'Помилка оплати' },
  { value: 'refunded', label: 'Повернено' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await get<Order[]>(API_ENDPOINTS.orders.adminAll);
      setOrders(data);
    } catch (err: any) {
      console.error('Помилка завантаження замовлень:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await put(
        `${API_ENDPOINTS.admin.updateOrderStatus(orderId)}?order_status=${newStatus}`,
        {}
      );
      await loadOrders();
    } catch (err: any) {
      alert('Помилка оновлення статусу: ' + (err.message || 'Невідома помилка'));
    }
  };

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      await put(
        `${API_ENDPOINTS.admin.updatePaymentStatus(orderId)}?payment_status=${newStatus}`,
        {}
      );
      await loadOrders();
    } catch (err: any) {
      alert('Помилка оновлення статусу оплати: ' + (err.message || 'Невідома помилка'));
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;
    return matchesStatus && matchesPayment;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-96 bg-glass rounded-xl animate-pulse border-2 border-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Управління замовленнями</h1>
          <p className="text-gray-400">Перегляд та управління всіма замовленнями</p>
        </div>

        {/* Filters */}
        <Card variant="glass" className="border-2">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Статус замовлення</label>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'Всі статуси' },
                    ...ORDER_STATUSES,
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Статус оплати</label>
                <Select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'Всі статуси' },
                    ...PAYMENT_STATUSES,
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card variant="glass" className="border-2 hover:border-primary/30 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        <span>Замовлення #{order.id.slice(-8).toUpperCase()}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          order.order_status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                          order.order_status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          order.order_status === 'shipped' ? 'bg-purple-500/20 text-purple-400' :
                          order.order_status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {ORDER_STATUSES.find(s => s.value === order.order_status)?.label || order.order_status}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          order.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' :
                          order.payment_status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {PAYMENT_STATUSES.find(s => s.value === order.payment_status)?.label || order.payment_status}
                        </span>
                      </CardTitle>
                      <p className="text-sm text-gray-400 mt-2">
                        {new Date(order.created_at).toLocaleString('uk-UA')} • {order.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{formatPrice(order.total_amount)}</p>
                      <p className="text-sm text-gray-400">
                        {order.items.length} {order.items.length === 1 ? 'товар' : 'товарів'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm p-2 bg-background-light rounded">
                        <span className="text-foreground">{item.product_name} × {item.quantity}</span>
                        <span className="text-gray-400">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Address */}
                  <div className="p-3 bg-background-light rounded border border-white/10">
                    <p className="text-sm text-foreground font-semibold mb-1">Адреса доставки:</p>
                    <p className="text-sm text-gray-400">{order.address.street}</p>
                    <p className="text-sm text-gray-400">{order.address.city}, {order.address.postal_code}</p>
                    <p className="text-sm text-gray-400">Телефон: {order.address.phone}</p>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-between pt-3 border-t border-white/10">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Товари:</span>
                        <span className="text-foreground">{formatPrice(order.items_total)}</span>
                      </div>
                      {order.delivery_cost > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Доставка:</span>
                          <span className="text-foreground">{formatPrice(order.delivery_cost)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-white/10">
                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-400">Статус замовлення</label>
                      <Select
                        value={order.order_status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        options={ORDER_STATUSES}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-400">Статус оплати</label>
                      <Select
                        value={order.payment_status}
                        onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                        options={PAYMENT_STATUSES}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <Card variant="glass" className="border-2">
            <CardContent className="pt-6 text-center py-16">
              <p className="text-gray-400 text-xl">Замовлення не знайдено</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

