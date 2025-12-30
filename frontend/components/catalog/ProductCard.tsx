/**
 * Компонент картки товару з Glassmorphism ефектом
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice, formatCapacity, formatPower } from '@/lib/utils';
import { StarRating } from './StarRating';
import type { Product } from '@/types/product';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const fallbackImage =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#252525"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#60a5fa" font-family="Arial" font-size="20" font-weight="600" opacity="0.4">PowerCore</text></svg>`
    );

  return (
    <Card hover className="h-full flex flex-col overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        whileHover={{ scale: 1.01 }}
        className="h-full flex flex-col"
      >
        <Link href={`/product/${product.id}`} className="flex-1 flex flex-col">
          {/* Image - компактна */}
          <div className="relative w-full h-40 rounded-t-xl overflow-hidden bg-white border-b border-white/10">
            <Image
              src={product.image_url || fallbackImage}
              alt={product.name}
              fill
              className="object-contain p-2"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = fallbackImage;
              }}
            />
          </div>

          {/* Content - компактний */}
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-semibold line-clamp-2 mb-1.5 leading-tight">{product.name}</CardTitle>
            <div className="flex items-center gap-1.5">
              <StarRating 
                rating={product.rating || 0} 
                ratingCount={product.rating_count || 0}
                size="sm"
              />
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-3 pt-0">
            {/* Specifications - компактні */}
            <div className="space-y-0.5 mb-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Ємність:</span>
                <span className="text-foreground font-medium">{formatCapacity(product.capacity)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Потужність:</span>
                <span className="text-foreground font-medium">{formatPower(product.power)}</span>
              </div>
            </div>

            {/* Price */}
            <div className="mt-auto pt-2 border-t border-white/10">
              <div className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </div>
            </div>
          </CardContent>
        </Link>

        {/* Add to Cart Button - компактний */}
        {onAddToCart && product.stock > 0 && (
          <div className="p-2.5 pt-0">
            <Button
              className="w-full text-sm h-8"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart(product);
              }}
              disabled={product.stock === 0}
            >
              В кошик
            </Button>
          </div>
        )}
      </motion.div>
    </Card>
  );
}

