/**
 * Компонент елемента кошика - сучасний дизайн
 */

'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import type { CartItem } from '@/types/cart';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface CartItemProps {
  item: CartItem;
}

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#252525"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#60a5fa" font-family="Arial" font-size="14" font-weight="600" opacity="0.4">PowerCore</text></svg>`
  );

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="group relative bg-glass rounded-xl border-2 border-white/10 hover:border-primary/30 transition-all p-4"
    >
      <div className="flex gap-4">
        {/* Image */}
        <Link href={`/product/${item.product_id}`} className="flex-shrink-0">
          <div className="relative w-24 h-24 bg-gradient-to-br from-background-light to-background-lighter rounded-lg overflow-hidden border-2 border-white/10 group-hover:border-primary/30 transition-all">
            <Image
              src={item.image_url || FALLBACK_IMAGE}
              alt={item.product_name}
              fill
              className="object-cover"
              sizes="96px"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = FALLBACK_IMAGE;
              }}
            />
          </div>
        </Link>

        {/* Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <Link href={`/product/${item.product_id}`}>
              <h4 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 mb-1">
                {item.product_name}
              </h4>
            </Link>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-sm text-gray-400">Ціна:</span>
              <span className="text-base font-bold text-primary">{formatPrice(item.price)}</span>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-background-light rounded-lg border border-white/10 p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                className="w-7 h-7 p-0 min-w-[28px] hover:bg-white/10"
                disabled={item.quantity <= 1}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </Button>
              <span className="w-8 text-center font-semibold text-foreground">{item.quantity}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                className="w-7 h-7 p-0 min-w-[28px] hover:bg-white/10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(item.product_id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Видалити
            </Button>
          </div>
        </div>

        {/* Total */}
        <div className="flex-shrink-0 text-right flex flex-col justify-between">
          <div className="text-lg font-bold text-primary">
            {formatPrice(item.price * item.quantity)}
          </div>
          <div className="text-xs text-gray-500">
            {item.quantity} × {formatPrice(item.price)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
