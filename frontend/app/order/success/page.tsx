/**
 * Сторінка успішного оформлення замовлення
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { get } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types/order';
import { motion } from 'framer-motion';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('ID замовлення не вказано');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const data = await get<Order>(API_ENDPOINTS.orders.detail(orderId));
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Не вдалося завантажити інформацію про замовлення');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      card: 'Банківська карта',
      cash: 'Готівка при отриманні',
      online: 'Онлайн оплата (LiqPay)',
    };
    return labels[method] || method;
  };

  const getDeliveryMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      courier: 'Кур\'єрська доставка',
      post: 'Нова Пошта',
      pickup: 'Самовивіз з магазину',
    };
    return labels[method] || method;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: 'Нове',
      processing: 'Обробляється',
      shipped: 'Відправлено',
      delivered: 'Доставлено',
      cancelled: 'Скасовано',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="h-96 bg-glass rounded-xl animate-pulse border-2 border-white/10" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card variant="glass" className="max-w-2xl mx-auto border-2">
          <CardContent className="text-center py-16">
            <p className="text-xl text-red-500 mb-4">{error || 'Замовлення не знайдено'}</p>
            <Link href="/catalog">
              <Button variant="primary">Повернутися до каталогу</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full mb-6">
            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Замовлення успішно оформлено!
          </h1>
          <p className="text-xl text-gray-400">
            Номер замовлення: <span className="font-bold text-primary">#{order.id.slice(-8).toUpperCase()}</span>
          </p>
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card variant="glass" className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Деталі замовлення
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-background-light rounded-lg border border-white/10">
                <span className="text-gray-400">Статус замовлення:</span>
                <span className="font-bold text-primary">{getStatusLabel(order.order_status)}</span>
              </div>

              {/* Payment Status */}
              <div className="flex items-center justify-between p-4 bg-background-light rounded-lg border border-white/10">
                <span className="text-gray-400">Статус оплати:</span>
                <span className={`font-bold ${order.payment_status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {order.payment_status === 'paid' ? 'Оплачено' : 'Очікує оплати'}
                </span>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">Товари:</h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-background-light rounded-lg border border-white/10">
                      <div>
                        <p className="font-semibold text-foreground">{item.product_name}</p>
                        <p className="text-sm text-gray-400">{item.quantity} × {formatPrice(item.price)}</p>
                      </div>
                      <p className="font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t-2 border-white/15 pt-4 space-y-2">
                <div className="flex justify-between text-base text-foreground">
                  <span>Сума товарів:</span>
                  <span className="font-semibold">{formatPrice(order.items_total || order.total_amount)}</span>
                </div>
                {order.delivery_cost > 0 && (
                  <div className="flex justify-between text-base text-foreground">
                    <span>Доставка:</span>
                    <span className="font-semibold">{formatPrice(order.delivery_cost)}</span>
                  </div>
                )}
                <div className="flex justify-between text-2xl font-bold text-primary pt-2 border-t-2 border-white/15">
                  <span>Всього:</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
              </div>

              {/* Payment & Delivery Methods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t-2 border-white/15">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Спосіб оплати:</p>
                  <p className="font-semibold text-foreground">{getPaymentMethodLabel(order.payment_method)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Спосіб доставки:</p>
                  <p className="font-semibold text-foreground">{getDeliveryMethodLabel(order.delivery_method)}</p>
                </div>
              </div>

              {/* Address */}
              <div className="pt-4 border-t-2 border-white/15">
                <h3 className="text-lg font-semibold mb-3 text-foreground">Адреса доставки:</h3>
                <div className="p-4 bg-background-light rounded-lg border border-white/10">
                  <p className="text-foreground">{order.address.street}</p>
                  <p className="text-foreground">{order.address.city}, {order.address.postal_code}</p>
                  <p className="text-gray-400 mt-2">Телефон: {order.address.phone}</p>
                  <p className="text-gray-400">Email: {order.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/catalog">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Продовжити покупки
            </Button>
          </Link>
          <Link href="/orders">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Мої замовлення
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

