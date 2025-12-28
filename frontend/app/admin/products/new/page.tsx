/**
 * Сторінка додавання нового товару
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { post } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import { motion } from 'framer-motion';

interface ProductFormData {
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

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

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

      await post(API_ENDPOINTS.products.list, productData);
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Помилка створення товару');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/products" className="text-gray-400 hover:text-primary transition-colors mb-2 inline-block">
              ← Назад до товарів
            </Link>
            <h1 className="text-4xl font-bold text-foreground">Додати новий товар</h1>
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
                    disabled={loading}
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
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      label="Ціна (грн) *"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      required
                      disabled={loading}
                      min="0"
                      step="0.01"
                    />

                    <Input
                      type="number"
                      label="Залишок на складі *"
                      value={formData.stock || ''}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      required
                      disabled={loading}
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
                      disabled={loading}
                      min="0"
                      placeholder="20000"
                    />

                    <Input
                      type="number"
                      label="Потужність (W)"
                      value={formData.power || ''}
                      onChange={(e) => setFormData({ ...formData, power: parseInt(e.target.value) || undefined })}
                      disabled={loading}
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
                        disabled={loading}
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
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Input
                    label="Бренд"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    disabled={loading}
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
                    disabled={loading}
                    placeholder="https://example.com/image.jpg"
                  />

                  <div className="flex items-center gap-3 p-4 bg-background-light rounded-lg border border-white/10">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      disabled={loading}
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
                    <Button variant="outline" className="w-full" disabled={loading}>
                      Скасувати
                    </Button>
                  </Link>
                  <Button type="submit" variant="primary" className="flex-1" isLoading={loading}>
                    Створити товар
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

