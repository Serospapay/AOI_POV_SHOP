import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Оформлення замовлення | PowerCore',
  description: 'Завершіть оформлення замовлення: перевірте адресу доставки та контакти.',
};

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children;
}

