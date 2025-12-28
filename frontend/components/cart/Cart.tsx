/**
 * Компонент кошика - сучасний дизайн
 */

'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { CartItem as CartItemComponent } from './CartItem';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Cart({ isOpen, onClose }: CartProps) {
  const { items, totalPrice, clearCart } = useCart();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Кошик" size="lg">
      <div className="space-y-6">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-xl text-gray-400 font-medium mb-2">Кошик порожній</p>
            <p className="text-sm text-gray-500">Додайте товари з каталогу</p>
            <Link href="/catalog" onClick={onClose}>
              <Button variant="primary" size="md" className="mt-6">
                Перейти до каталогу
              </Button>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Items List */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.div
                    key={item.product_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <CartItemComponent item={item} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border-t-2 border-white/15 pt-6 space-y-4"
            >
              {/* Total */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-background-light to-background-lighter rounded-lg border-2 border-primary/20">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-lg font-semibold text-foreground">Загалом:</span>
                </div>
                <span className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</span>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={clearCart}
                  variant="outline"
                  className="flex-1"
                  size="md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Очистити кошик
                </Button>
                <Link href="/checkout" className="flex-1" onClick={onClose}>
                  <Button
                    variant="primary"
                    className="w-full"
                    size="md"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Оформити замовлення
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </Modal>
  );
}
