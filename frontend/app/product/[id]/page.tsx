/**
 * Сторінка детальної інформації про товар
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { get, post, ApiClientError } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice, formatCapacity, formatPower } from '@/lib/utils';
import { StarRating } from '@/components/catalog/StarRating';
import { ProductCard } from '@/components/catalog/ProductCard';
import { ReviewList } from '@/components/reviews/ReviewList';
import { useCart } from '@/hooks/useCart';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/types/product';
import { motion } from 'framer-motion';

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#252525"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#60a5fa" font-family="Arial" font-size="36" font-weight="600" opacity="0.4">PowerCore</text></svg>`
  );

// Функція для визначення категорії товару
const getProductCategory = (product: Product): string => {
  const name = product.name.toLowerCase();
  if (name.includes('ups') || name.includes('back-ups')) return 'UPS';
  if (name.includes('solar')) return 'Solar';
  if (name.includes('jump') || name.includes('car')) return 'Car Starter';
  if (name.includes('powerhouse') || name.includes('river') || name.includes('station')) return 'Power Station';
  if (name.includes('wireless') && name.includes('stand')) return 'Wireless Stand';
  if (name.includes('laptop') || product.power >= 40) return 'Laptop Power Bank';
  return 'Power Bank';
};

// Функція для отримання переваг товару
const getProductFeatures = (product: Product): string[] => {
  const features: string[] = [];
  const name = product.name.toLowerCase();
  const desc = product.description.toLowerCase();

  if (name.includes('wireless') || desc.includes('бездротов')) {
    features.push('Бездротова зарядка Qi');
  }
  if (name.includes('solar') || desc.includes('сонячн')) {
    features.push('Зарядка від сонця');
  }
  if (product.power >= 40) {
    features.push('Зарядка ноутбуків');
  }
  if (product.power >= 18) {
    features.push('Швидка зарядка');
  }
  if (product.capacity >= 20000) {
    features.push('Висока ємність');
  }
  if (desc.includes('ipx') || desc.includes('захист') || desc.includes('вод')) {
    features.push('Захист від води');
  }
  if (name.includes('slim') || name.includes('blade') || (product.weight && product.weight < 0.25)) {
    features.push('Компактний дизайн');
  }
  if (name.includes('pd') || desc.includes('power delivery')) {
    features.push('USB-C Power Delivery');
  }
  if (name.includes('ups') || name.includes('back-ups')) {
    features.push('Захист від збоїв живлення');
    features.push('Автоматичне регулювання напруги');
  }
  if (name.includes('jump') || name.includes('car')) {
    features.push('Запуск автомобіля');
    features.push('LED ліхтар');
  }

  return features.length > 0 ? features : ['Висока якість', 'Надійність', 'Сучасні технології'];
};

// Функція для отримання інформації про використання
const getUsageInfo = (product: Product): { title: string; description: string }[] => {
  const category = getProductCategory(product);
  const usage: { title: string; description: string }[] = [];

  if (category === 'Power Bank') {
    usage.push({
      title: 'Для смартфонів',
      description: `Може зарядити середній смартфон ${Math.floor(product.capacity / 3000)}-${Math.floor(product.capacity / 2500)} разів`,
    });
    if (product.power >= 18) {
      usage.push({
        title: 'Швидка зарядка',
        description: 'Підтримує технології швидкої зарядки для сучасних пристроїв',
      });
    }
  }

  if (category === 'Laptop Power Bank' || product.power >= 40) {
    usage.push({
      title: 'Для ноутбуків',
      description: 'Може зарядити більшість ноутбуків один раз повністю',
    });
  }

  if (category === 'UPS') {
    usage.push({
      title: 'Захист ПК',
      description: 'Забезпечує безперебійну роботу комп\'ютера при збоях електропостачання',
    });
    usage.push({
      title: 'Захист даних',
      description: 'Запобігає втраті даних при раптовому відключенні світла',
    });
  }

  if (category === 'Solar') {
    usage.push({
      title: 'Для подорожей',
      description: 'Заряджається від сонця, ідеальний для кемпінгу та походів',
    });
  }

  if (category === 'Car Starter') {
    usage.push({
      title: 'Запуск авто',
      description: 'Може запустити двигун при розрядженому акумуляторі',
    });
  }

  return usage.length > 0 ? usage : [
    {
      title: 'Універсальне використання',
      description: 'Підходить для різних пристроїв та ситуацій',
    },
  ];
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'usage'>('details');
  const { addItem } = useCart();

  // Завантажуємо подібні товари
  const { products: similarProducts } = useProducts({ page: 1, limit: 4 });

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await get<Product>(API_ENDPOINTS.products.detail(productId));
        setProduct(data);
      } catch (err) {
        if (err instanceof ApiClientError) {
          const msg = err.data?.message || err.data?.detail || `HTTP ${err.status}`;
          setError(msg);
        } else {
          setError(err instanceof Error ? err.message : 'Помилка завантаження товару');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleRetry = () => {
    if (!productId) return;
    setProduct(null);
    setError(null);
    setLoading(true);
    get<Product>(API_ENDPOINTS.products.detail(productId))
      .then(setProduct)
      .catch((err) => {
        if (err instanceof ApiClientError) {
          const msg = err.data?.message || err.data?.detail || `HTTP ${err.status}`;
          setError(msg);
        } else {
          setError(err instanceof Error ? err.message : 'Помилка завантаження товару');
        }
      })
      .finally(() => setLoading(false));
  };

  const handleAddToCart = () => {
    if (product) {
      addItem({
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: 1,
        image_url: product.image_url,
      });
    }
  };

  const handleRate = async (rating: number) => {
    if (!product || ratingLoading) return;
    
    try {
      setRatingLoading(true);
      await post(API_ENDPOINTS.products.rate(product.id), {
        rating,
      });
      
      const updatedProduct = await get<Product>(API_ENDPOINTS.products.detail(product.id));
      setProduct(updatedProduct);
    } catch (err) {
      console.error('Помилка при оцінюванні:', err);
      alert('Не вдалося оцінити товар. Спробуйте пізніше.');
    } finally {
      setRatingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-96 bg-glass rounded-xl animate-pulse border-2 border-white/10" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card variant="glass">
          <CardContent className="text-center py-16 space-y-4">
            <p className="text-xl text-red-500">{error || 'Товар не знайдено'}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleRetry}>
                Спробувати ще раз
              </Button>
              <Link href="/catalog">
                <Button variant="ghost">До каталогу</Button>
              </Link>
              <Link href="/">
                <Button variant="ghost">На головну</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const features = getProductFeatures(product);
  const usageInfo = getUsageInfo(product);
  const category = getProductCategory(product);
  
  // Фільтруємо подібні товари (виключаємо поточний товар)
  const filteredSimilar = similarProducts
    .filter(p => p.id !== product.id && getProductCategory(p) === category)
    .slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Головна</Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-primary transition-colors">Каталог</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Image - компактний блок */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2"
        >
          <div className="sticky top-24">
            <div className="relative w-full aspect-square bg-white rounded-xl overflow-hidden border-2 border-white/15 shadow-lg">
              <Image
                src={product.image_url || FALLBACK_IMAGE}
                alt={product.name}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 40vw"
                priority
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = FALLBACK_IMAGE;
                }}
              />
              {product.stock === 0 && (
                <div className="absolute top-3 right-3 bg-red-500/90 text-white px-3 py-1.5 rounded-lg text-xs font-semibold z-10">
                  Немає в наявності
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Details - компактний та функціональний */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-3"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-block px-2.5 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-md">
                {category}
              </div>
              {product.rating && product.rating >= 4.5 && (
                <span className="px-2.5 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-md">
                  Топ продажів
                </span>
              )}
            </div>
            
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-3 flex-wrap">
              <StarRating 
                rating={product.rating || 0} 
                ratingCount={product.rating_count || 0}
                size="md"
                interactive={true}
                onRate={handleRate}
              />
            </div>
            
            <div className="flex items-baseline gap-3">
              <div className="text-3xl lg:text-4xl font-bold text-primary">
                {formatPrice(product.price)}
              </div>
            </div>

            {/* Stock Status - компактний */}
            <div className="flex items-center gap-2 py-2">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {product.stock > 0 ? `В наявності: ${product.stock} шт.` : 'Немає в наявності'}
              </span>
            </div>

            {/* Action Button - виділений */}
            <div className="pt-2">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                size="lg"
                className="w-full lg:w-auto min-w-[200px]"
              >
                {product.stock > 0 ? 'Додати в кошик' : 'Немає в наявності'}
              </Button>
            </div>

            {/* Description - компактний */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-gray-300 text-sm leading-relaxed">{product.description}</p>
            </div>

            {/* Features - компактний grid */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/10">
              {features.slice(0, 6).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex gap-2 border-b border-white/10">
          {[
            { id: 'details' as const, label: 'Деталі' },
            { id: 'specs' as const, label: 'Характеристики' },
            { id: 'usage' as const, label: 'Використання' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mb-12">
        {activeTab === 'details' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Card variant="glass" className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Переваги
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Гарантія
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Гарантія:</span>
                  <span className="text-foreground font-semibold">12 місяців</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Сервіс:</span>
                  <span className="text-foreground font-semibold">Офіційний</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Доставка:</span>
                  <span className="text-foreground font-semibold">1-3 дні</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Оплата:</span>
                  <span className="text-foreground font-semibold">Готівка / Картка</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'specs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="glass" className="border-2">
              <CardHeader>
                <CardTitle>Технічні характеристики</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Ємність:
                      </span>
                      <span className="text-foreground font-semibold">{formatCapacity(product.capacity)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Потужність:
                      </span>
                      <span className="text-foreground font-semibold">{formatPower(product.power)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Тип батареї:
                      </span>
                      <span className="text-foreground font-semibold">{product.battery_type}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {product.weight && (
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-gray-500 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                          </svg>
                          Вага:
                        </span>
                        <span className="text-foreground font-semibold">{product.weight} кг</span>
                      </div>
                    )}
                    {product.dimensions && (
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-gray-500 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          Габарити:
                        </span>
                        <span className="text-foreground font-semibold">{product.dimensions}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        На складі:
                      </span>
                      <span className={`font-semibold ${product.stock > 0 ? 'text-primary' : 'text-red-400'}`}>
                        {product.stock > 0 ? `${product.stock} шт.` : 'Немає в наявності'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'usage' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {usageInfo.map((info, idx) => (
              <Card key={idx} variant="glass" className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">{info.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm leading-relaxed">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="mb-8">
        <ReviewList productId={product.id} productName={product.name} />
      </div>

      {/* Similar Products - компактні картки */}
      {filteredSimilar.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Подібні товари</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredSimilar.map((similarProduct) => (
              <ProductCard
                key={similarProduct.id}
                product={similarProduct}
                onAddToCart={(p) => {
                  addItem({
                    product_id: p.id,
                    product_name: p.name,
                    price: p.price,
                    quantity: 1,
                    image_url: p.image_url,
                  });
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
