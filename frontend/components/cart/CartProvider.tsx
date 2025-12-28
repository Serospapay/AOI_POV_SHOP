/**
 * Context Provider для кошика (LocalStorage)
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CartItem, CartContextType } from '@/types/cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'powercore_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Завантажуємо кошик з LocalStorage при монтуванні
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored && stored.trim()) {
          try {
            const parsed = JSON.parse(stored);
            // Перевіряємо чи це масив
            if (Array.isArray(parsed)) {
              setItems(parsed);
            } else {
              // Якщо не масив, очищаємо
              localStorage.removeItem(CART_STORAGE_KEY);
            }
          } catch (parseError) {
            console.error('Помилка парсингу кошика:', parseError);
            // Очищаємо пошкоджені дані
            localStorage.removeItem(CART_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Помилка завантаження кошика:', error);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  // Зберігаємо кошик в LocalStorage при зміні
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Помилка збереження кошика:', error);
      }
    }
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === item.product_id);
      if (existing) {
        // Оновлюємо кількість якщо товар вже є
        return prev.map((i) =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      // Додаємо новий товар
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product_id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

