/**
 * Сторінка калькулятора підбору power bank
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { post } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/catalog/ProductCard';
import type { Product } from '@/types/product';

interface Device {
  id: string;
  name: string;
  battery_capacity: number;
  charge_count: number;
}

// Популярні пристрої для швидкого вибору
const POPULAR_DEVICES = [
  { name: 'iPhone 15 Pro', battery_capacity: 3274 },
  { name: 'iPhone 14', battery_capacity: 3279 },
  { name: 'Samsung Galaxy S23', battery_capacity: 3900 },
  { name: 'Samsung Galaxy S24 Ultra', battery_capacity: 5000 },
  { name: 'iPad Pro 12.9"', battery_capacity: 10758 },
  { name: 'MacBook Pro 14"', battery_capacity: 70000, power_consumption: 67 },
  { name: 'MacBook Air M2', battery_capacity: 52000, power_consumption: 30 },
  { name: 'AirPods Pro', battery_capacity: 500 },
  { name: 'Apple Watch', battery_capacity: 300 },
  { name: 'Nintendo Switch', battery_capacity: 4310 },
];

export default function CalculatorPage() {
  const [devices, setDevices] = useState<Device[]>([
    { id: '1', name: '', battery_capacity: 0, charge_count: 1 }
  ]);
  const [usageDays, setUsageDays] = useState(7);
  const [efficiency, setEfficiency] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const addDevice = () => {
    setDevices([...devices, {
      id: Date.now().toString(),
      name: '',
      battery_capacity: 0,
      charge_count: 1
    }]);
  };

  const removeDevice = (id: string) => {
    if (devices.length > 1) {
      setDevices(devices.filter(d => d.id !== id));
    }
  };

  const updateDevice = (id: string, field: keyof Device, value: string | number) => {
    setDevices(devices.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const selectPopularDevice = (device: typeof POPULAR_DEVICES[0]) => {
    const newDevice: Device = {
      id: Date.now().toString(),
      name: device.name,
      battery_capacity: device.battery_capacity,
      charge_count: 1
    };
    setDevices([...devices, newDevice]);
  };

  const calculate = async () => {
    // Валідація
    const validDevices = devices.filter(d => d.name && d.battery_capacity > 0);
    if (validDevices.length === 0) {
      setError('Додайте хоча б один пристрій з ємністю батареї');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await post(API_ENDPOINTS.calculator.powerBank, {
        devices: validDevices.map(d => ({
          name: d.name,
          battery_capacity: d.battery_capacity,
          charge_count: d.charge_count
        })),
        usage_days: usageDays,
        efficiency: efficiency
      });

      setResults(response);
    } catch (err: any) {
      setError(err.message || 'Помилка при розрахунку');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background-dark py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl font-bold text-foreground bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Калькулятор підбору Power Bank
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Розрахуйте необхідну ємність та знайдіть ідеальний power bank для ваших пристроїв
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Форма розрахунку */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card variant="glass" className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Ваші пристрої</CardTitle>
                <p className="text-sm text-gray-400 mt-2">
                  Додайте пристрої, які потрібно заряджати
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Популярні пристрої */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Швидкий вибір популярних пристроїв
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_DEVICES.slice(0, 6).map((device) => (
                      <Button
                        key={device.name}
                        variant="outline"
                        size="sm"
                        onClick={() => selectPopularDevice(device)}
                        className="text-xs"
                      >
                        {device.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Список пристроїв */}
                <div className="space-y-3">
                  {devices.map((device, index) => (
                    <motion.div
                      key={device.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-background-light rounded-lg border border-white/10 space-y-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          Пристрій {index + 1}
                        </span>
                        {devices.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeDevice(device.id)}
                            className="text-red-400 border-red-400/30 hover:bg-red-500/10"
                          >
                            Видалити
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-400">
                            Назва пристрою
                          </label>
                          <Input
                            value={device.name}
                            onChange={(e) => updateDevice(device.id, 'name', e.target.value)}
                            placeholder="Наприклад: iPhone 15"
                            className="bg-background border-white/10"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-400">
                            Ємність батареї (mAh)
                          </label>
                          <Input
                            type="number"
                            value={device.battery_capacity || ''}
                            onChange={(e) => updateDevice(device.id, 'battery_capacity', parseInt(e.target.value) || 0)}
                            placeholder="3000"
                            className="bg-background border-white/10"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-400">
                            Кількість зарядок
                          </label>
                          <Input
                            type="number"
                            value={device.charge_count}
                            onChange={(e) => updateDevice(device.id, 'charge_count', parseInt(e.target.value) || 1)}
                            min={1}
                            className="bg-background border-white/10"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Button
                  onClick={addDevice}
                  variant="outline"
                  className="w-full border-dashed"
                >
                  + Додати пристрій
                </Button>
              </CardContent>
            </Card>

            {/* Налаштування */}
            <Card variant="glass" className="border-2">
              <CardHeader>
                <CardTitle>Налаштування розрахунку</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    На скільки днів потрібен заряд
                  </label>
                  <Select
                    value={usageDays.toString()}
                    onChange={(e) => setUsageDays(parseInt(e.target.value))}
                    options={[
                      { value: '1', label: '1 день' },
                      { value: '3', label: '3 дні' },
                      { value: '7', label: '1 тиждень' },
                      { value: '14', label: '2 тижні' },
                      { value: '30', label: '1 місяць' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Ефективність зарядки: {Math.round(efficiency * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.05"
                    value={efficiency}
                    onChange={(e) => setEfficiency(parseFloat(e.target.value))}
                    className="w-full h-2 bg-background-light rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Стандартна ефективність: 80%. Враховує втрати при зарядці.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Кнопка розрахунку */}
            <Button
              onClick={calculate}
              disabled={loading}
              variant="primary"
              size="lg"
              className="w-full text-lg py-6"
            >
              {loading ? 'Розраховуємо...' : 'Розрахувати та підібрати товари'}
            </Button>

            {error && (
              <Card variant="glass" className="border-2 border-red-500/50">
                <CardContent className="pt-6 text-center">
                  <p className="text-red-400">{error}</p>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Інформаційна панель */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card variant="glass" className="border-2 sticky top-8">
              <CardHeader>
                <CardTitle>Як це працює?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-300">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">1. Додайте пристрої</h4>
                  <p>Вкажіть назву та ємність батареї кожного пристрою, який потрібно заряджати.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">2. Вкажіть кількість зарядок</h4>
                  <p>Скільки разів потрібно зарядити кожен пристрій за вказаний період.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">3. Отримайте рекомендації</h4>
                  <p>Калькулятор підбере найкращі power bank з урахуванням ваших потреб.</p>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-2">
              <CardHeader>
                <CardTitle>Поради</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <p>Додавайте запас 20-30% до розрахованої ємності для комфортного використання</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <p>Для подорожей обирайте компактні моделі з великою ємністю</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <p>Перевіряйте підтримку швидкої зарядки для ваших пристроїв</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Результати */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <Card variant="glass" className="border-2 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-2xl">Результати розрахунку</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Деталі розрахунку */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-background-light rounded-lg border border-white/10">
                      <p className="text-sm text-gray-400 mb-1">Необхідна ємність</p>
                      <p className="text-2xl font-bold text-primary">
                        {results.required_capacity.toLocaleString()} mAh
                      </p>
                    </div>
                    <div className="p-4 bg-background-light rounded-lg border border-white/10">
                      <p className="text-sm text-gray-400 mb-1">Пристроїв додано</p>
                      <p className="text-2xl font-bold text-foreground">
                        {results.calculation_details.total_devices}
                      </p>
                    </div>
                    <div className="p-4 bg-background-light rounded-lg border border-white/10">
                      <p className="text-sm text-gray-400 mb-1">Період використання</p>
                      <p className="text-2xl font-bold text-foreground">
                        {results.calculation_details.usage_days} дн.
                      </p>
                    </div>
                  </div>

                  {/* Деталі по пристроях */}
                  {results.calculation_details.device_details.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-foreground">Деталі розрахунку</h3>
                      <div className="space-y-2">
                        {results.calculation_details.device_details.map((device: any, index: number) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-background-light rounded border border-white/10"
                          >
                            <div>
                              <p className="font-medium text-foreground">{device.name}</p>
                              <p className="text-xs text-gray-400">
                                {device.battery_capacity.toLocaleString()} mAh × {device.charge_count} зарядок
                              </p>
                            </div>
                            <p className="font-semibold text-primary">
                              {device.total_capacity.toLocaleString()} mAh
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Рекомендовані товари */}
                  {results.recommended_products.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-foreground">
                        Рекомендовані Power Bank ({results.recommended_products.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.recommended_products.map((product: Product) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ProductCard product={product} />
                            {product.charge_cycles && (
                              <p className="text-xs text-gray-400 mt-2 text-center">
                                Зможе зарядити ваші пристрої ~{product.charge_cycles} разів
                              </p>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.recommended_products.length === 0 && (
                    <Card variant="glass" className="border-2">
                      <CardContent className="pt-6 text-center py-12">
                        <p className="text-gray-400 text-lg">
                          Не знайдено підходящих товарів. Спробуйте змінити параметри розрахунку.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
