/**
 * Компонент форми для створення відгуку
 */

'use client';

import { useState } from 'react';
import { post } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import { StarRating } from '@/components/catalog/StarRating';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import type { ReviewCreate } from '@/types/review';

interface ReviewFormProps {
  productId: string;
  productName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReviewForm({ productId, productName, onSuccess, onCancel }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Будь ласка, оберіть оцінку');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Відгук повинен містити мінімум 10 символів');
      return;
    }

    if (!user && !userName.trim()) {
      setError('Будь ласка, введіть ваше ім\'я');
      return;
    }

    try {
      setLoading(true);
      const reviewData: ReviewCreate = {
        product_id: productId,
        rating,
        comment: comment.trim(),
        ...(user ? {} : { user_name: userName.trim() }),
      };

      await post(API_ENDPOINTS.reviews.create(productId), reviewData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Помилка при створенні відгуку');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-glass rounded-xl p-6 border-2 border-white/10 space-y-4">
      <h4 className="text-lg font-semibold text-foreground mb-4">Залишити відгук про {productName}</h4>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {!user && (
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">
            Ваше ім'я *
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
            placeholder="Введіть ваше ім'я"
            required
            disabled={loading}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Оцінка *
        </label>
        <StarRating
          rating={rating}
          interactive={true}
          onRate={setRating}
          size="md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Відгук *
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full h-32 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 resize-none"
          placeholder="Розкажіть про ваш досвід використання товару..."
          required
          disabled={loading}
          minLength={10}
          maxLength={2000}
        />
        <p className="text-xs text-gray-400 mt-1">
          {comment.length}/2000 символів (мінімум 10)
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          Скасувати
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading || rating === 0 || comment.trim().length < 10}
          className="flex-1"
          isLoading={loading}
        >
          Відправити відгук
        </Button>
      </div>

      <p className="text-xs text-gray-400">
        Ваш відгук буде опублікований після модерації
      </p>
    </form>
  );
}

