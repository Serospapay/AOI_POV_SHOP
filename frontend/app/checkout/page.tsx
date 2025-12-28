/**
 * Сторінка оформлення замовлення
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { post } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import type { OrderAddress, CreateOrderRequest, Order } from '@/types/order';

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { isAuthenticated, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentDeliveryMethod, setCurrentDeliveryMethod] = useState('courier');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Чекаємо поки авторизація завантажиться
    if (authLoading) {
      return;
    }

    // Перевіряємо, чи є товари в кошику
    if (items.length === 0) {
      router.push('/catalog');
      return;
    }

    // Більше не вимагаємо авторизації - неавторизовані користувачі теж можуть купувати
    setIsChecking(false);
  }, [items, authLoading, router]);

  const handleSubmit = async (address: OrderAddress, email: string, paymentMethod: string, deliveryMethod: string, notes?: string) => {
    setIsLoading(true);

    try {
      const orderData: CreateOrderRequest = {
        user_id: isAuthenticated ? '' : undefined, // Бекенд встановить з токена, якщо авторизований
        items: items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
        })),
        address,
        email,
        notes,
        payment_method: paymentMethod,
        delivery_method: deliveryMethod,
      };

      // Використовуємо token якщо є, інакше відправляємо без авторизації
      const order = await post<Order>(API_ENDPOINTS.orders.create, orderData, token || undefined);

      // Очищаємо кошик після успішного замовлення
      clearCart();

      // Перенаправляємо на сторінку успіху
      router.push(`/order/success?id=${order.id}`);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Показуємо loading під час перевірки
  if (isChecking || authLoading || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="h-96 bg-glass rounded-xl animate-pulse border-2 border-white/10 flex items-center justify-center">
            <div className="text-gray-400">Завантаження...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link 
          href="/catalog" 
          className="inline-flex items-center text-gray-400 hover:text-primary transition-colors mb-4"
        >
          ← Назад до каталогу
        </Link>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          Оформлення замовлення
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <CheckoutForm 
            onDeliveryMethodChange={setCurrentDeliveryMethod}
            onSubmit={handleSubmit} 
            isLoading={isLoading} 
          />
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <OrderSummary deliveryMethod={currentDeliveryMethod} />
        </div>
      </div>
    </div>
  );
}

