/**
 * Форма реєстрації
 */

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    if (password.length < 8) {
      setError('Пароль має бути мінімум 8 символів');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, fullName);
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Помилка реєстрації. Спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
          {error}
        </div>
      )}

      <Input
        type="text"
        label="Повне ім'я"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
        disabled={isLoading}
      />

      <Input
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isLoading}
      />

      <Input
        type="password"
        label="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isLoading}
        minLength={8}
      />

      <Input
        type="password"
        label="Підтвердити пароль"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        disabled={isLoading}
        minLength={8}
      />

      <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
        Зареєструватися
      </Button>
    </form>
  );
}

