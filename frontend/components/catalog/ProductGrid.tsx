/**
 * Компонент сітки товарів з покращеним дизайном
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from './ProductCard';
import { StarRating } from '@/components/catalog/StarRating';
import { Button } from '@/components/ui/button';
import { formatPrice, formatCapacity, formatPower } from '@/lib/utils';
import type { Product } from '@/types/product';
import { motion } from 'framer-motion';

interface ProductGridProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  loading?: boolean;
}

export function ProductGrid({ products, onAddToCart, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-96 bg-glass rounded-xl animate-pulse border-2 border-white/10"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0 && !loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block p-4 bg-glass rounded-full mb-4">
          <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-xl text-gray-400 font-medium">Товари не знайдено</p>
        <p className="text-sm text-gray-500 mt-2">Спробуйте змінити фільтри або пошук</p>
      </div>
    );
  }

  // Відсортуємо товари за рейтингом для показу найкращих спочатку
  const sortedProducts = [...products].sort((a, b) => {
    const ratingA = (a.rating || 0) * (a.rating_count || 0);
    const ratingB = (b.rating || 0) * (b.rating_count || 0);
    return ratingB - ratingA;
  });

  // Перший товар - featured (великий)
  const featuredProduct = sortedProducts[0];
  const otherProducts = sortedProducts.slice(1);

  return (
    <div className="space-y-8">
      {/* Featured Product */}
      {featuredProduct && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-background-light to-background-lighter p-8">
            <div className="absolute top-0 right-0 bg-primary/20 px-4 py-2 rounded-bl-xl">
              <span className="text-xs font-bold text-primary uppercase tracking-wide">Рекомендовано</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="relative aspect-square lg:aspect-[4/3] rounded-xl overflow-hidden border-2 border-white/10 bg-white">
                {featuredProduct.image_url ? (
                  <Image
                    src={featuredProduct.image_url}
                    alt={featuredProduct.name}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-24 h-24 text-gray-500 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{featuredProduct.name}</h3>
                  <StarRating 
                    rating={featuredProduct.rating || 0} 
                    ratingCount={featuredProduct.rating_count || 0}
                    size="md"
                  />
                </div>
                <p className="text-gray-300 line-clamp-3">{featuredProduct.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">Ємність: <span className="text-foreground font-semibold">{formatCapacity(featuredProduct.capacity)}</span></span>
                  <span className="text-gray-400">Потужність: <span className="text-foreground font-semibold">{formatPower(featuredProduct.power)}</span></span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="text-3xl font-bold text-primary">
                    {formatPrice(featuredProduct.price)}
                  </div>
                  <div className="flex gap-3">
                    <Link href={`/product/${featuredProduct.id}`}>
                      <Button variant="outline" size="md">
                        Деталі
                      </Button>
                    </Link>
                    {onAddToCart && featuredProduct.stock > 0 && (
                      <Button
                        onClick={() => onAddToCart(featuredProduct)}
                        variant="primary"
                        size="md"
                      >
                        В кошик
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Regular Grid */}
      {otherProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {otherProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

