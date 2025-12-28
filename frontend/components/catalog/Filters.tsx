/**
 * Компонент фільтрів для каталогу товарів - покращена версія
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { ProductFilters } from '@/types/product';
import { motion, AnimatePresence } from 'framer-motion';

interface FiltersProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  batteryTypes?: string[];
  brands?: string[];
}

const BRANDS = ['Xiaomi', 'Anker', 'Baseus', 'Samsung', 'Belkin', 'APC', 'CyberPower', 'NOCO', 'EcoFlow'];

export function Filters({ filters, onFiltersChange, batteryTypes = ['Li-Ion', 'Li-Polymer', 'Lead-Acid', 'NiMH'], brands = BRANDS }: FiltersProps) {
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters);
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Перевіряємо чи є активні фільтри
  useEffect(() => {
    const active = Object.keys(localFilters).some(key => {
      const value = localFilters[key as keyof ProductFilters];
      return value !== undefined && value !== null && value !== '';
    });
    setHasActiveFilters(active);
  }, [localFilters]);

  // Синхронізуємо локальні фільтри з зовнішніми
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (field: keyof ProductFilters, value: string | number | undefined) => {
    const newFilters = { ...localFilters, [field]: value || undefined };
    setLocalFilters(newFilters);
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const handleReset = () => {
    const emptyFilters: ProductFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const activeFiltersCount = Object.values(localFilters).filter(v => v !== undefined && v !== null && v !== '').length;

  return (
    <Card variant="glass" className="border-2 sticky top-24 flex flex-col" style={{ maxHeight: 'calc(100vh - 7rem)' }}>
      <CardHeader className="border-b border-white/10 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Фільтри
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </CardTitle>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-white/5 transition-colors"
            aria-label={isExpanded ? 'Згорнути' : 'Розгорнути'}
          >
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden flex-1 flex flex-col min-h-0"
          >
            <CardContent className="space-y-4 pt-4 pb-2 overflow-y-auto flex-1 min-h-0 pr-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 20rem)' }}>
              {/* Виробник */}
              <div>
                <label className="block text-xs font-semibold mb-2 text-foreground flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Виробник
                </label>
                <Select
                  value={localFilters.brand || ''}
                  onChange={(e) => handleChange('brand', e.target.value || undefined)}
                  options={[
                    { value: '', label: 'Всі виробники' },
                    ...brands.map(brand => ({ value: brand, label: brand }))
                  ]}
                  className="text-sm"
                />
              </div>

              {/* Ціна */}
              <div>
                <label className="block text-xs font-semibold mb-2 text-foreground flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ціна (грн)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Від"
                    value={localFilters.price_min || ''}
                    onChange={(e) => handleChange('price_min', e.target.value ? Number(e.target.value) : undefined)}
                    className="text-sm py-2"
                  />
                  <Input
                    type="number"
                    placeholder="До"
                    value={localFilters.price_max || ''}
                    onChange={(e) => handleChange('price_max', e.target.value ? Number(e.target.value) : undefined)}
                    className="text-sm py-2"
                  />
                </div>
              </div>

              {/* Ємність */}
              <div>
                <label className="block text-xs font-semibold mb-2 text-foreground flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Ємність (mAh)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Від"
                    value={localFilters.capacity_min || ''}
                    onChange={(e) => handleChange('capacity_min', e.target.value ? Number(e.target.value) : undefined)}
                    className="text-sm py-2"
                  />
                  <Input
                    type="number"
                    placeholder="До"
                    value={localFilters.capacity_max || ''}
                    onChange={(e) => handleChange('capacity_max', e.target.value ? Number(e.target.value) : undefined)}
                    className="text-sm py-2"
                  />
                </div>
              </div>

              {/* Потужність */}
              <div>
                <label className="block text-xs font-semibold mb-2 text-foreground flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Потужність (Вт)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Від"
                    value={localFilters.power_min || ''}
                    onChange={(e) => handleChange('power_min', e.target.value ? Number(e.target.value) : undefined)}
                    className="text-sm py-2"
                  />
                  <Input
                    type="number"
                    placeholder="До"
                    value={localFilters.power_max || ''}
                    onChange={(e) => handleChange('power_max', e.target.value ? Number(e.target.value) : undefined)}
                    className="text-sm py-2"
                  />
                </div>
              </div>

              {/* Тип батареї */}
              <div>
                <label className="block text-xs font-semibold mb-2 text-foreground flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Тип батареї
                </label>
                <Select
                  value={localFilters.battery_type || ''}
                  onChange={(e) => handleChange('battery_type', e.target.value || undefined)}
                  options={[
                    { value: '', label: 'Всі типи' },
                    ...batteryTypes.map(type => ({ value: type, label: type }))
                  ]}
                  className="text-sm"
                />
              </div>

              {/* Категорія */}
              <div>
                <label className="block text-xs font-semibold mb-2 text-foreground flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Категорія
                </label>
                <Select
                  value={localFilters.category || ''}
                  onChange={(e) => handleChange('category', e.target.value || undefined)}
                  options={[
                    { value: '', label: 'Всі категорії' },
                    { value: 'Power Bank', label: 'Power Bank' },
                    { value: 'UPS', label: 'UPS' },
                    { value: 'Solar', label: 'Сонячні' },
                    { value: 'Car Starter', label: 'Авто стартери' },
                    { value: 'Power Station', label: 'Електростанції' },
                    { value: 'Wireless Stand', label: 'Бездротові станції' },
                    { value: 'Laptop Power Bank', label: 'Для ноутбуків' },
                  ]}
                  className="text-sm"
                />
              </div>

              {/* Quick Filters */}
              <div className="pt-2 border-t border-white/10">
                <label className="block text-xs font-semibold mb-2 text-foreground">Швидкі фільтри</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => {
                      const newFilters = { ...localFilters, capacity_min: 10000, capacity_max: undefined };
                      setLocalFilters(newFilters);
                    }}
                    className="px-2.5 py-1 text-xs bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/30 rounded-md transition-all text-foreground"
                  >
                    10K+ mAh
                  </button>
                  <button
                    onClick={() => {
                      const newFilters = { ...localFilters, power_min: 18, power_max: undefined };
                      setLocalFilters(newFilters);
                    }}
                    className="px-2.5 py-1 text-xs bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/30 rounded-md transition-all text-foreground"
                  >
                    Швидка зарядка
                  </button>
                  <button
                    onClick={() => {
                      const newFilters = { ...localFilters, price_max: 2000 };
                      setLocalFilters(newFilters);
                    }}
                    className="px-2.5 py-1 text-xs bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/30 rounded-md transition-all text-foreground"
                  >
                    До 2000 грн
                  </button>
                </div>
              </div>
            </CardContent>

            {/* Buttons - закріплені внизу */}
            <div className="flex gap-2 p-4 pt-2 border-t border-white/10 flex-shrink-0">
              <Button
                onClick={handleApply}
                disabled={!hasActiveFilters}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Застосувати
              </Button>
              <Button
                onClick={handleReset}
                disabled={!hasActiveFilters}
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0"
                aria-label="Скинути фільтри"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
