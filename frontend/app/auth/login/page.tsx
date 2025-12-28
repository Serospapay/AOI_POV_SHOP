/**
 * Сторінка входу
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/LoginForm';
import { DemoAuth } from '@/components/auth/DemoAuth';

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Login Form */}
        <div className="flex items-center justify-center">
          <Card variant="glass-strong" className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-3xl text-center">Вхід</CardTitle>
            </CardHeader>
            <CardContent>
              <LoginForm />
              <div className="mt-6 text-center text-sm text-gray-400">
                Немає акаунту?{' '}
                <Link href="/auth/register" className="text-foreground hover:text-primary transition-colors">
                  Зареєструватися
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Auth */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <DemoAuth />
          </div>
        </div>
      </div>
    </div>
  );
}

