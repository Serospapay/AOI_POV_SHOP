/**
 * Сторінка контактів
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Контакти | PowerCore',
  description: 'Зв’яжіться з PowerCore: email, телефон, графік роботи та консультації.',
};

export default function ContactsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-foreground tracking-tight">
            Контакти
          </h1>
          <p className="text-xl text-gray-400 font-light">
            Зв'яжіться з нами будь-яким зручним способом
          </p>
        </div>

        {/* Contact information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="glass" className="p-8">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground font-semibold">Контактна інформація</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2 text-gray-400 uppercase tracking-wide">Email</h3>
                <a 
                  href="mailto:info@powercore.ua" 
                  className="text-foreground hover:text-primary transition-colors text-lg"
                >
                  info@powercore.ua
                </a>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2 text-gray-400 uppercase tracking-wide">Телефон</h3>
                <a 
                  href="tel:+380501234567" 
                  className="text-foreground hover:text-primary transition-colors text-lg"
                >
                  +380 50 123 4567
                </a>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2 text-gray-400 uppercase tracking-wide">Графік роботи</h3>
                <p className="text-foreground text-lg">
                  Пн-Пт: 9:00 - 18:00<br />
                  Сб-Нд: Вихідний
                </p>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="p-8">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground font-semibold">Зв'язатися з нами</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Маєте питання або потребуєте консультації? Напишіть нам на email 
                або зателефонуйте. Наша команда з радістю допоможе вам з вибором 
                оптимального рішення для резервного живлення.
              </p>
              <p className="text-gray-400 text-sm">
                Ми намагаємося відповідати на всі запити протягом 24 годин.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional info */}
        <Card variant="glass" className="p-8">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground font-semibold">Доставка та обслуговування</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300 leading-relaxed">
            <p>
              Ми здійснюємо доставку по всій території України. Термін доставки 
              зазвичай становить 1-3 робочих дні.
            </p>
            <p>
              Всі товари постачаються з офіційною гарантією від виробника та 
              повним комплектом документації.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

