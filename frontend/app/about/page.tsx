/**
 * Сторінка "Про нас"
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Про нас | PowerCore',
  description: 'Дізнайтеся про PowerCore: спеціалісти з резервного живлення та підтримки клієнтів.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-foreground tracking-tight">
            Про PowerCore
          </h1>
          <p className="text-xl text-gray-400 font-light">
            Ваш надійний партнер у світі резервного живлення
          </p>
        </div>

        {/* Main content */}
        <Card variant="glass" className="p-8">
          <div className="prose prose-invert max-w-none space-y-6">
            <h2 className="text-3xl font-semibold text-foreground mb-4 tracking-tight">Наша історія</h2>
            <p className="text-gray-300 leading-relaxed text-base">
              PowerCore — це інтернет-магазин пристроїв резервного живлення нового покоління. 
              Ми спеціалізуємося на наданні високоякісних рішень для забезпечення безперебійного 
              живлення вашого обладнання.
            </p>
            <p className="text-gray-300 leading-relaxed text-base">
              Наша місія — зробити резервне живлення доступним та надійним для кожного. 
              Ми працюємо тільки з перевіреними виробниками та пропонуємо сертифіковану 
              продукцію з офіційною гарантією.
            </p>
          </div>
        </Card>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="glass" className="p-6">
            <h3 className="text-xl font-semibold mb-3 text-foreground">Якість</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Тільки сертифікована продукція від провідних виробників
            </p>
          </Card>
          <Card variant="glass" className="p-6">
            <h3 className="text-xl font-semibold mb-3 text-foreground">Надійність</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Гарантія якості та підтримка на всіх етапах
            </p>
          </Card>
          <Card variant="glass" className="p-6">
            <h3 className="text-xl font-semibold mb-3 text-foreground">Доступність</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Швидка доставка по всій Україні та конкурентоспроможні ціни
            </p>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/catalog">
            <Button size="lg">
              Перейти до каталогу
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

