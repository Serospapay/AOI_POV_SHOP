/**
 * Компонент списку відгуків
 */

'use client';

import { useState, useEffect } from 'react';
import { get } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import type { Review } from '@/types/review';
import { motion } from 'framer-motion';

interface ReviewListProps {
  productId: string;
  productName: string;
}

export function ReviewList({ productId, productName }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await get<Review[]>(API_ENDPOINTS.reviews.getByProduct(productId));
      setReviews(data);
    } catch (err: any) {
      setError(err.message || 'Помилка завантаження відгуків');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAdded = () => {
    setShowForm(false);
    loadReviews();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-glass rounded-xl animate-pulse border-2 border-white/10" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок та кнопка додати відгук */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground">Відгуки</h3>
          <p className="text-sm text-gray-400 mt-1">
            {reviews.length > 0 ? `${reviews.length} відгуків` : 'Поки немає відгуків'}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm font-medium"
          >
            Залишити відгук
          </button>
        )}
      </div>

      {/* Форма додавання відгуку */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <ReviewForm
            productId={productId}
            productName={productName}
            onSuccess={handleReviewAdded}
            onCancel={() => setShowForm(false)}
          />
        </motion.div>
      )}

      {/* Список відгуків */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {reviews.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">Поки немає відгуків. Будьте першим!</p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ReviewCard review={review} onUpdate={loadReviews} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

