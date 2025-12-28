/**
 * Багатокрокова форма оформлення замовлення
 */

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OrderAddress } from '@/types/order';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckoutFormProps {
  onSubmit: (address: OrderAddress, email: string, paymentMethod: string, deliveryMethod: string, notes?: string) => Promise<void>;
  onDeliveryMethodChange?: (method: string) => void;
  isLoading?: boolean;
}

const PAYMENT_METHODS = [
  { value: 'card', label: 'Банківська карта (онлайн)' },
  { value: 'cash', label: 'Готівка при отриманні' },
  { value: 'online', label: 'Онлайн оплата (LiqPay)' },
];

const DELIVERY_METHODS = [
  { value: 'courier', label: 'Кур\'єрська доставка' },
  { value: 'post', label: 'Нова Пошта' },
  { value: 'pickup', label: 'Самовивіз з магазину' },
];

type Step = 1 | 2 | 3 | 4 | 5;

export function CheckoutForm({ onSubmit, onDeliveryMethodChange, isLoading }: CheckoutFormProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryMethod, setDeliveryMethod] = useState('courier');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!email) newErrors.email = 'Email обов\'язковий';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Невірний формат email';
      }
      if (!phone) newErrors.phone = 'Телефон обов\'язковий';
      else if (!/^\+?380\d{9}$/.test(phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Невірний формат телефону (наприклад: +380501234567)';
      }
    }

    if (step === 2) {
      if (!street.trim()) newErrors.street = 'Вулиця обов\'язкова';
      if (!city.trim()) newErrors.city = 'Місто обов\'язкове';
      if (!postalCode.trim()) newErrors.postalCode = 'Поштовий індекс обов\'язковий';
      else if (!/^\d{5}$/.test(postalCode)) {
        newErrors.postalCode = 'Невірний формат індексу (5 цифр)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep((prev) => (prev + 1) as Step);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валідація всіх кроків
    if (!validateStep(1) || !validateStep(2)) {
      setCurrentStep(1);
      return;
    }

    const address: OrderAddress = {
      street,
      city,
      postal_code: postalCode,
      country: 'Україна',
      phone,
    };

    try {
      await onSubmit(address, email, paymentMethod, deliveryMethod, notes || undefined);
    } catch (err: any) {
      setErrors({ submit: err.message || 'Помилка оформлення замовлення' });
    }
  };

  const steps = [
    { number: 1, title: 'Контакти', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { number: 2, title: 'Адреса', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
    { number: 3, title: 'Доставка', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    )},
    { number: 4, title: 'Оплата', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )},
    { number: 5, title: 'Підтвердження', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    currentStep >= step.number
                      ? 'bg-primary border-primary text-white'
                      : 'bg-background-light border-white/20 text-gray-400'
                  }`}
                >
                  {currentStep > step.number ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium ${currentStep >= step.number ? 'text-foreground' : 'text-gray-500'}`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-all ${
                    currentStep > step.number ? 'bg-primary' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <Card variant="glass" className="border-2 border-red-500/50 bg-red-500/10">
          <CardContent className="pt-6">
            <p className="text-red-400 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.submit}
            </p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {/* Step 1: Контактна інформація */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="glass" className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Контактна інформація
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <Input
                    type="email"
                    label="Email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    required
                    disabled={isLoading}
                    placeholder="example@email.com"
                    error={errors.email}
                  />
                  <Input
                    type="tel"
                    label="Телефон"
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      const formatted = value.startsWith('380') ? `+${value}` : value.startsWith('0') ? `+38${value}` : value ? `+380${value}` : '';
                      setPhone(formatted);
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    required
                    disabled={isLoading}
                    placeholder="+380501234567"
                    error={errors.phone}
                    maxLength={13}
                  />
                  <p className="text-xs text-gray-500">
                    Ми використаємо ці дані для зв'язку з вами щодо замовлення
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Адреса доставки */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="glass" className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Адреса доставки
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <Input
                    type="text"
                    label="Вулиця та номер будинку"
                    value={street}
                    onChange={(e) => {
                      setStreet(e.target.value);
                      if (errors.street) setErrors({ ...errors, street: '' });
                    }}
                    required
                    disabled={isLoading}
                    placeholder="вул. Хрещатик, 1"
                    error={errors.street}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      label="Місто"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (errors.city) setErrors({ ...errors, city: '' });
                      }}
                      required
                      disabled={isLoading}
                      placeholder="Київ"
                      error={errors.city}
                    />
                    <Input
                      type="text"
                      label="Поштовий індекс"
                      value={postalCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                        setPostalCode(value);
                        if (errors.postalCode) setErrors({ ...errors, postalCode: '' });
                      }}
                      required
                      disabled={isLoading}
                      placeholder="01001"
                      error={errors.postalCode}
                      maxLength={5}
                    />
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm text-primary flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Перевірте правильність адреси - від цього залежить швидкість доставки
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Спосіб доставки */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="glass" className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Спосіб доставки
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <Select
                    value={deliveryMethod}
                    onChange={(e) => {
                      setDeliveryMethod(e.target.value);
                      onDeliveryMethodChange?.(e.target.value);
                    }}
                    options={DELIVERY_METHODS}
                    disabled={isLoading}
                  />
                  <div className="mt-4 space-y-3">
                    {deliveryMethod === 'courier' && (
                      <div className="p-4 bg-background-light rounded-lg border border-white/10">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="font-semibold text-foreground mb-1">Кур'єрська доставка</p>
                            <p className="text-sm text-gray-400 mb-2">Доставка до дверей кур'єром</p>
                            <p className="text-sm text-primary font-semibold">150 грн (безкоштовно від 2000 грн)</p>
                            <p className="text-xs text-gray-500 mt-2">Термін доставки: 1-2 робочих дні</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {deliveryMethod === 'post' && (
                      <div className="p-4 bg-background-light rounded-lg border border-white/10">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="font-semibold text-foreground mb-1">Нова Пошта</p>
                            <p className="text-sm text-gray-400 mb-2">Доставка до відділення або поштомату</p>
                            <p className="text-sm text-primary font-semibold">80 грн (безкоштовно від 2000 грн)</p>
                            <p className="text-xs text-gray-500 mt-2">Термін доставки: 2-3 робочих дні</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {deliveryMethod === 'pickup' && (
                      <div className="p-4 bg-background-light rounded-lg border border-white/10">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="font-semibold text-foreground mb-1">Самовивіз з магазину</p>
                            <p className="text-sm text-gray-400 mb-2">Забрати товар самостійно з нашого магазину</p>
                            <p className="text-sm text-primary font-semibold">Безкоштовно</p>
                            <p className="text-xs text-gray-500 mt-2">Адреса магазину: м. Київ, вул. Хрещатик, 1</p>
                            <p className="text-xs text-gray-500">Графік роботи: Пн-Пт 10:00-20:00, Сб-Нд 11:00-18:00</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Спосіб оплати */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="glass" className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Спосіб оплати
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    options={PAYMENT_METHODS}
                    disabled={isLoading}
                  />
                  <div className="mt-4 space-y-3">
                    {paymentMethod === 'card' && (
                      <div className="p-4 bg-background-light rounded-lg border border-white/10">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <div>
                            <p className="font-semibold text-foreground mb-1">Банківська карта (онлайн)</p>
                            <p className="text-sm text-gray-400 mb-2">Безпечна оплата карткою Visa/Mastercard</p>
                            <p className="text-xs text-gray-500">Після підтвердження замовлення ви будете перенаправлені на сторінку оплати</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {paymentMethod === 'cash' && (
                      <div className="p-4 bg-background-light rounded-lg border border-white/10">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <div>
                            <p className="font-semibold text-foreground mb-1">Готівка при отриманні</p>
                            <p className="text-sm text-gray-400 mb-2">Оплата готівкою кур'єру або в магазині</p>
                            <p className="text-xs text-gray-500">Доступно тільки для кур'єрської доставки та самовивозу</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {paymentMethod === 'online' && (
                      <div className="p-4 bg-background-light rounded-lg border border-white/10">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          <div>
                            <p className="font-semibold text-foreground mb-1">Онлайн оплата (LiqPay)</p>
                            <p className="text-sm text-gray-400 mb-2">Швидка та безпечна оплата через LiqPay</p>
                            <p className="text-xs text-gray-500">Підтримуються картки, Google Pay, Apple Pay</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Примітки */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Примітки до замовлення (необов'язково)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full h-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all resize-none"
                      placeholder="Додаткові побажання щодо доставки або замовлення..."
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 5: Підтвердження */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="glass" className="border-2 border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Перевірка даних замовлення
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  {/* Контактна інформація */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Контактна інформація</h3>
                    <div className="p-4 bg-background-light rounded-lg border border-white/10 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-foreground font-semibold">{email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Телефон:</span>
                        <span className="text-foreground font-semibold">{phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Адреса */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Адреса доставки</h3>
                    <div className="p-4 bg-background-light rounded-lg border border-white/10 space-y-2">
                      <div className="text-foreground">
                        <p className="font-semibold">{street}</p>
                        <p className="text-sm text-gray-400">{city}, {postalCode}</p>
                        <p className="text-sm text-gray-400">Україна</p>
                      </div>
                    </div>
                  </div>

                  {/* Доставка та оплата */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Доставка</h3>
                      <div className="p-4 bg-background-light rounded-lg border border-white/10">
                        <p className="text-foreground font-semibold">
                          {DELIVERY_METHODS.find(m => m.value === deliveryMethod)?.label}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Оплата</h3>
                      <div className="p-4 bg-background-light rounded-lg border border-white/10">
                        <p className="text-foreground font-semibold">
                          {PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label}
                        </p>
                      </div>
                    </div>
                  </div>

                  {notes && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Примітки</h3>
                      <div className="p-4 bg-background-light rounded-lg border border-white/10">
                        <p className="text-foreground text-sm">{notes}</p>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm text-primary flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Перевірте всі дані перед підтвердженням. Після відправки замовлення змінити дані буде неможливо.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4 pt-6">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isLoading}
              size="lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Назад
            </Button>
          )}
          <div className="flex-1" />
          {currentStep < 5 ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              disabled={isLoading}
              size="lg"
              className="ml-auto"
            >
              Далі
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              isLoading={isLoading}
              size="lg"
              className="ml-auto"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Підтвердити замовлення
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
