/**
 * Компонент для демо авторизації з різними ролями
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { decodeJWT } from '@/lib/jwt';

interface DemoUser {
  email: string;
  password: string;
  role: 'guest' | 'user' | 'admin';
  description: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    email: 'demo@powercore.com',
    password: 'demo12345',
    role: 'user',
    description: 'Звичайний користувач - може купувати товари',
  },
  {
    email: 'admin@powercore.com',
    password: 'admin12345',
    role: 'admin',
    description: 'Адміністратор - повний доступ до адмін панелі',
  },
];

export function DemoAuth() {
  const [selectedRole, setSelectedRole] = useState<'guest' | 'user' | 'admin' | null>(null);
  const { login } = useAuth();

  const handleDemoLogin = async (demoUser: DemoUser) => {
    try {
      await login(demoUser.email, demoUser.password);
      setSelectedRole(demoUser.role);
      // Перенаправляємо на головну або адмін панель
      if (demoUser.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error('Помилка демо входу:', error);
      const errorMessage = error?.message || 'Невідома помилка';
      alert(`Помилка входу: ${errorMessage}\n\nПереконайтеся, що:\n1. Бекенд запущений\n2. Користувач існує в БД\n3. Дані входу правильні`);
    }
  };

  const handleGuestMode = () => {
    // Очищаємо токен для гостевого режиму
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setSelectedRole('guest');
    window.location.reload();
  };

  return (
    <Card variant="glass" className="border-2 border-primary/30">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Демо авторизація
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Швидкий доступ до різних ролей для тестування функціоналу
            </p>
          </div>

          {/* Guest Mode */}
          <div className="p-4 bg-background-light rounded-lg border border-white/10">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">Гість (Неавторизований)</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded">GUEST</span>
                </div>
                <p className="text-xs text-gray-500">Може переглядати каталог та купувати без реєстрації</p>
              </div>
            </div>
            <Button
              variant={selectedRole === 'guest' ? 'primary' : 'outline'}
              size="sm"
              onClick={handleGuestMode}
              className="w-full mt-2"
            >
              {selectedRole === 'guest' ? '✓ Активний режим гостя' : 'Увійти як гість'}
            </Button>
          </div>

          {/* Demo Users */}
          {DEMO_USERS.map((demoUser) => (
            <div key={demoUser.email} className="p-4 bg-background-light rounded-lg border border-white/10">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">
                      {demoUser.role === 'admin' ? 'Адміністратор' : 'Користувач'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      demoUser.role === 'admin' 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-primary/20 text-primary'
                    }`}>
                      {demoUser.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{demoUser.description}</p>
                  <div className="text-xs text-gray-600 space-y-0.5">
                    <div><strong>Email:</strong> {demoUser.email}</div>
                    <div><strong>Password:</strong> {demoUser.password}</div>
                  </div>
                </div>
              </div>
              <Button
                variant={selectedRole === demoUser.role ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleDemoLogin(demoUser)}
                className="w-full mt-2"
                disabled={selectedRole === demoUser.role}
              >
                {selectedRole === demoUser.role ? '✓ Активний' : `Увійти як ${demoUser.role === 'admin' ? 'Адмін' : 'Користувач'}`}
              </Button>
            </div>
          ))}

          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-gray-500 text-center">
              Примітка: Для роботи демо авторизації потрібно, щоб користувачі існували в базі даних
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

