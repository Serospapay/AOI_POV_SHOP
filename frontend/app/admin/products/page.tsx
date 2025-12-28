/**
 * Сторінка управління товарами
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { get, del } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  is_active: boolean;
  image_url?: string;
  brand?: string;
  category?: string;
}

type SortField = 'name' | 'price' | 'stock' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await get<{ items: Product[]; total: number }>(
        `${API_ENDPOINTS.products.list}?limit=100`
      );
      setProducts(response.items || []);
    } catch (err: any) {
      console.error('Помилка завантаження товарів:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей товар?')) {
      return;
    }

    try {
      await del(API_ENDPOINTS.products.detail(productId));
      setProducts(products.filter((p) => p.id !== productId));
    } catch (err: any) {
      alert('Помилка видалення товару: ' + (err.message || 'Невідома помилка'));
    }
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterActive === null || product.is_active === filterActive;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'name') {
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-96 bg-glass rounded-xl animate-pulse border-2 border-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Управління товарами</h1>
            <p className="text-gray-400">Створення, редагування та видалення товарів</p>
          </div>
          <Link href="/admin/products/new">
            <Button variant="primary" size="lg">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Додати товар
            </Button>
          </Link>
        </div>

        {/* Filters & Sort */}
        <Card variant="glass" className="border-2">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  type="text"
                  placeholder="Пошук товарів..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <div className="flex gap-2">
                  <Button
                    variant={filterActive === null ? 'primary' : 'outline'}
                    onClick={() => setFilterActive(null)}
                  >
                    Всі
                  </Button>
                  <Button
                    variant={filterActive === true ? 'primary' : 'outline'}
                    onClick={() => setFilterActive(true)}
                  >
                    Активні
                  </Button>
                  <Button
                    variant={filterActive === false ? 'primary' : 'outline'}
                    onClick={() => setFilterActive(false)}
                  >
                    Неактивні
                  </Button>
                </div>
              </div>

              {/* Sort */}
              <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                <span className="text-sm text-gray-400 whitespace-nowrap">Сортувати за:</span>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as SortField)}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
                  >
                    <option value="name">Назвою</option>
                    <option value="price">Ціною</option>
                    <option value="stock">Залишком</option>
                  </select>
                  <Button
                    variant={sortOrder === 'asc' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSortOrder('asc')}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    За зростанням
                  </Button>
                  <Button
                    variant={sortOrder === 'desc' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSortOrder('desc')}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    За спаданням
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card variant="glass" className="border-2 hover:border-primary/30 transition-all">
                <div className="relative w-full h-32 bg-white rounded-t-lg overflow-hidden border-b border-white/10">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {!product.is_active && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold z-10">
                      Неактивний
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ціна:</span>
                      <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Залишок:</span>
                      <span className={`font-semibold ${product.stock < 10 ? 'text-red-400' : 'text-foreground'}`}>
                        {product.stock} шт.
                      </span>
                    </div>
                    {product.brand && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Бренд:</span>
                        <span className="text-foreground">{product.brand}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-white/10">
                    <Link href={`/admin/products/${product.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        Редагувати
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      Видалити
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <Card variant="glass" className="border-2">
            <CardContent className="pt-6 text-center py-16">
              <p className="text-gray-400 text-xl">Товари не знайдено</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

