/**
 * Сторінка реєстрації
 */

import Link from 'next/link';
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Реєстрація | PowerCore',
  description: 'Створіть акаунт PowerCore, щоб зберігати кошик та переглядати історію замовлень.',
};

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card variant="glass-strong" className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Реєстрація</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <div className="mt-6 text-center text-sm text-gray-400">
            Вже є акаунт?{' '}
            <Link href="/auth/login" className="text-foreground hover:text-primary transition-colors">
              Увійти
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

