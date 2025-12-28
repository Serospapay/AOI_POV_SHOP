/**
 * Компонент підсумку замовлення
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';

interface OrderSummaryProps {
  deliveryMethod?: string;
}

export function OrderSummary({ deliveryMethod = 'courier' }: OrderSummaryProps) {
  const { items, totalPrice } = useCart();
  
  // Розраховуємо вартість доставки
  const calculateDeliveryCost = (itemsTotal: number, method: string): number => {
    if (itemsTotal >= 2000 && method !== 'pickup') {
      return 0;
    }
    const costs: Record<string, number> = {
      courier: 150,
      post: 80,
      pickup: 0,
    };
    return costs[method] || 150;
  };
  
  const itemsTotal = totalPrice;
  const deliveryCost = calculateDeliveryCost(itemsTotal, deliveryMethod);
  const finalTotal = itemsTotal + deliveryCost;

  return (
    <Card variant="glass" className="sticky top-24">
      <CardHeader>
        <CardTitle>Підсумок замовлення</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <Link 
              key={item.product_id} 
              href={`/product/${item.product_id}`}
              className="flex gap-3 hover:bg-glass/50 rounded-lg p-2 -m-2 transition-colors"
            >
              <div className="relative w-16 h-16 bg-background-light rounded-lg overflow-hidden flex-shrink-0">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{item.product_name}</p>
                <p className="text-xs text-gray-400">
                  {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t-2 border-white/15 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Товарів:</span>
            <span>{items.length}</span>
          </div>
          <div className="flex justify-between text-base text-foreground">
            <span>Сума товарів:</span>
            <span className="font-semibold">{formatPrice(itemsTotal)}</span>
          </div>
          {deliveryCost > 0 && (
            <div className="flex justify-between text-base text-foreground">
              <span>Доставка:</span>
              <span className="font-semibold">{formatPrice(deliveryCost)}</span>
            </div>
          )}
          {deliveryCost === 0 && deliveryMethod !== 'pickup' && (
            <div className="flex justify-between text-sm text-primary">
              <span>Доставка:</span>
              <span className="font-semibold">Безкоштовно</span>
            </div>
          )}
          <div className="flex justify-between text-2xl font-bold text-primary pt-2 border-t-2 border-white/15">
            <span>До сплати:</span>
            <span>{formatPrice(finalTotal)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

