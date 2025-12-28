/**
 * Головна сторінка PowerCore
 */
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductCard } from '@/components/catalog/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/types/product';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { products, loading } = useProducts({ page: 1, limit: 4 });
  const { addItem } = useCart();

  // Топ товари за рейтингом
  const topProducts = [...products]
    .sort((a, b) => {
      const ratingA = (a.rating || 0) * (a.rating_count || 0);
      const ratingB = (b.rating || 0) * (b.rating_count || 0);
      return ratingB - ratingA;
    })
    .slice(0, 3);

  const handleAddToCart = (product: Product) => {
    addItem({
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url,
    });
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16">
        <div className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold text-foreground tracking-tight mb-4">
              PowerCore
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
              Інтернет-магазин пристроїв резервного живлення нового покоління
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex gap-4 justify-center pt-4"
          >
            <Link href="/catalog">
              <Button size="lg">
                Перейти до каталогу
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Top Products Section */}
      {topProducts.length > 0 && (
        <section className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-3">Популярні товари</h2>
              <p className="text-gray-400 text-lg">Найкращі оцінки від наших клієнтів</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link href="/catalog">
                <Button variant="outline" size="lg">
                  Переглянути всі товари
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      )}

      {/* How to Choose Section */}
      <section className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-3">Як вибрати Power Bank?</h2>
            <p className="text-gray-400 text-lg">Корисні поради для правильного вибору</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="glass" className="border-2 hover:border-primary/30 transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <CardTitle className="text-lg">Ємність</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Для смартфона: 5000-10000 mAh. Для планшета: 10000-20000 mAh. Для ноутбука: від 20000 mAh.
                </p>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-2 hover:border-primary/30 transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle className="text-lg">Потужність</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Швидка зарядка потребує 18W+. Для ноутбуків потрібен Power Delivery (PD) від 45W.
                </p>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-2 hover:border-primary/30 transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <CardTitle className="text-lg">Порти</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 leading-relaxed">
                  USB-C для сучасних пристроїв, USB-A для сумісності. Wireless зарядка - зручний бонус.
                </p>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-2 hover:border-primary/30 transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
                <CardTitle className="text-lg">Розмір</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Компактні моделі (до 200г) для щоденного використання. Потужніші - для подорожей.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card variant="glass" className="border-2 p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {products.length > 0 ? products.length + '+' : '10+'}
                </div>
                <div className="text-gray-400 text-sm md:text-base">Моделей у каталозі</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">100%</div>
                <div className="text-gray-400 text-sm md:text-base">Оригінальна продукція</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">1-3</div>
                <div className="text-gray-400 text-sm md:text-base">Дні доставка</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">24/7</div>
                <div className="text-gray-400 text-sm md:text-base">Підтримка клієнтів</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-3">Чому PowerCore?</h2>
            <p className="text-gray-400 text-lg">Наші переваги</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="glass" className="border-2 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Сертифікована якість</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Всі товари мають сертифікати відповідності та проходять перевірку перед відправкою.
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="glass" className="border-2 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Швидка доставка</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Доставка по всій Україні протягом 1-3 робочих днів. Безкоштовна доставка від 2000 грн.
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="glass" className="border-2 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Офіційна гарантія</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Гарантія від виробника на всі товари. Повне сервісне обслуговування та підтримка.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card variant="glass" className="border-2 border-primary/30 p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Готові знайти ідеальний Power Bank?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Перегляньте наш каталог та оберіть пристрій, який відповідає вашим потребам
            </p>
            <Link href="/catalog">
              <Button size="lg">
                Перейти до каталогу
              </Button>
            </Link>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
