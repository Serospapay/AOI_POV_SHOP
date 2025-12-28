/**
 * Сторінка редагування товару
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { get, put } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  capacity?: number;
  power?: number;
  battery_type?: string;
  brand?: string;
  category?: string;
  image_url?: string;
  is_active: boolean;
}

const BATTERY_TYPES = [
  { value: 'Li-Ion', label: 'Li-Ion' },
  { value: 'Li-Po', label: 'Li-Po' },
  { value: 'NiMH', label: 'NiMH' },
  { value: 'Lead-Acid', label: 'Lead-Acid' },
];

const CATEGORIES = [
  { value: 'powerbank', label: 'Power Bank' },
  { value: 'ups', label: 'UPS' },
  { value: 'solar', label: 'Сонячні панелі' },
  { value: 'inverter', label: 'Інвертор' },
  { value: 'charger', label: 'Зарядний пристрій' },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Product>({
    id: '',
    name: '',
    description: '',
    price: 0,
    stock: 0,
    capacity: undefined,
    power: undefined,
    battery_type: '',
    brand: '',
    category: '',
    image_url: '',
    is_active: true,
  });

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const product = await get<Product>(API_ENDPOINTS.products.detail(productId));
      setFormData({
        id: product.id,
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        stock: product.stock || 0,
        capacity: product.capacity,
        power: product.power,
        battery_type: product.battery_type || '',
        brand: product.brand || '',
        category: product.category || '',
        image_url: product.image_url || '',
        is_active: product.is_active !== undefined ? product.is_active : true,
      });
    } catch (err: any) {
      setError(err.message || 'Помилка завантаження товару');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      // Валідація
      if (!formData.name.trim()) {
        throw new Error('Назва товару обов\'язкова');
      }
      if (formData.price <= 0) {
        throw new Error('Ціна повинна бути більше 0');
      }
      if (formData.stock < 0) {
        throw new Error('Залишок не може бути від\'ємним');
      }

      // Підготовка даних для відправки
      const productData: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: formData.price,
        stock: formData.stock,
        is_active: formData.is_active,
      };

      if (formData.capacity) productData.capacity = formData.capacity;
      if (formData.power) productData.power = formData.power;
      if (formData.battery_type) productData.battery_type = formData.battery_type;
      if (formData.brand) productData.brand = formData.brand;
      if (formData.category) productData.category = formData.category;
      if (formData.image_url) productData.image_url = formData.image_url;

      await put(API_ENDPOINTS.products.detail(productId), productData);
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Помилка оновлення товару');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-96 bg-glass rounded-xl animate-pulse border-2 border-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/products" className="text-gray-400 hover:text-primary transition-colors mb-2 inline-block">
              ← Назад до товарів
            </Link>
            <h1 className="text-4xl font-bold text-foreground">Редагувати товар</h1>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="glass" className="border-2">
            <CardHeader>
              <CardTitle>Інформація про товар</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                    {error}
                  </div>
                )}

                {/* Основна інформація */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b border-white/10 pb-2">
                    Основна інформація
                  </h3>

                  <Input
                    label="Назва товару *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={saving}
                    placeholder="Наприклад: PowerBank 20000mAh"
                  />

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Опис товару
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full h-32 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all resize-none"
                      placeholder="Детальний опис товару..."
                      disabled={saving}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      label="Ціна (грн) *"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      required
                      disabled={saving}
                      min="0"
                      step="0.01"
                    />

                    <Input
                      type="number"
                      label="Залишок на складі *"
                      value={formData.stock || ''}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      required
                      disabled={saving}
                      min="0"
                    />
                  </div>
                </div>

                {/* Технічні характеристики */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b border-white/10 pb-2">
                    Технічні характеристики
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      label="Ємність (mAh)"
                      value={formData.capacity || ''}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || undefined })}
                      disabled={saving}
                      min="0"
                      placeholder="20000"
                    />

                    <Input
                      type="number"
                      label="Потужність (W)"
                      value={formData.power || ''}
                      onChange={(e) => setFormData({ ...formData, power: parseInt(e.target.value) || undefined })}
                      disabled={saving}
                      min="0"
                      placeholder="100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Select
                        label="Тип батареї"
                        value={formData.battery_type || ''}
                        onChange={(e) => setFormData({ ...formData, battery_type: e.target.value })}
                        options={[
                          { value: '', label: 'Не вказано' },
                          ...BATTERY_TYPES,
                        ]}
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <Select
                        label="Категорія"
                        value={formData.category || ''}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        options={[
                          { value: '', label: 'Не вказано' },
                          ...CATEGORIES,
                        ]}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <Input
                    label="Бренд"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    disabled={saving}
                    placeholder="Наприклад: Anker, Xiaomi"
                  />
                </div>

                {/* Зображення та статус */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b border-white/10 pb-2">
                    Додаткова інформація
                  </h3>

                  <Input
                    type="url"
                    label="URL зображення"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    disabled={saving}
                    placeholder="https://example.com/image.jpg"
                  />

                  <div className="flex items-center gap-3 p-4 bg-background-light rounded-lg border border-white/10">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      disabled={saving}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-primary focus:ring-primary"
                    />
                    <label htmlFor="is_active" className="text-sm text-foreground cursor-pointer">
                      Товар активний (відображається в каталозі)
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-white/10">
                  <Link href="/admin/products" className="flex-1">
                    <Button variant="outline" className="w-full" disabled={saving}>
                      Скасувати
                    </Button>
                  </Link>
                  <Button type="submit" variant="primary" className="flex-1" isLoading={saving}>
                    Зберегти зміни
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

