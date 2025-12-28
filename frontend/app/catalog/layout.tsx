import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Каталог | PowerCore',
  description: 'Каталог пристроїв резервного живлення PowerCore з фільтрами та пошуком.',
};

export default function CatalogLayout({ children }: { children: ReactNode }) {
  return children;
}

