/**
 * Компонент для відображення статусу підключення до API
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { get } from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';

export function ApiStatus() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkApi = async () => {
      try {
        setIsChecking(true);
        await get('/health');
        setIsOnline(true);
      } catch (error) {
        setIsOnline(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkApi();
    // Перевіряємо кожні 10 секунд
    const interval = setInterval(checkApi, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isOnline === null || isOnline) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 p-4"
      >
        <Card variant="glass" className="border-2 border-red-500/50 bg-red-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-400">
                  Не вдалося підключитися до сервера
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Бекенд недоступний на {API_BASE_URL}. Переконайтеся, що Docker контейнери запущені.
                </p>
              </div>
              {isChecking && (
                <div className="animate-spin">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

