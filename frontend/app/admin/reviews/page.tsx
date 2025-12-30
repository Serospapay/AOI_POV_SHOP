/**
 * Сторінка модерації відгуків
 */

'use client';

import { useEffect, useState } from 'react';
import { get, post, del } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/catalog/StarRating';
import { formatDate } from '@/lib/utils';
import type { Review } from '@/types/review';
import { motion } from 'framer-motion';

export default function ReviewsModerationPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moderatingId, setModeratingId] = useState<string | null>(null);

  useEffect(() => {
    loadPendingReviews();
  }, []);

  const loadPendingReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      // Завантажуємо всі відгуки для адмін панелі
      const data = await get<Review[]>(`${API_ENDPOINTS.admin.pendingReviews}?all_reviews=true`);
      setReviews(data);
    } catch (err: any) {
      setError(err.message || 'Помилка завантаження відгуків');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (reviewId: string, isApproved: boolean) => {
    try {
      setModeratingId(reviewId);
      const url = `${API_ENDPOINTS.admin.moderateReview(reviewId)}?is_approved=${isApproved}`;
      await post(url, {});
      await loadPendingReviews();
    } catch (err: any) {
      alert(err.message || 'Помилка при модерації відгуку');
    } finally {
      setModeratingId(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей відгук?')) {
      return;
    }

    try {
      setModeratingId(reviewId);
      await del(API_ENDPOINTS.admin.deleteReview(reviewId));
      await loadPendingReviews();
    } catch (err: any) {
      alert(err.message || 'Помилка при видаленні відгуку');
    } finally {
      setModeratingId(null);
    }
  };

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
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Управління відгуками</h1>
          <p className="text-gray-400">
            {reviews.length > 0 
              ? `Всього відгуків: ${reviews.length}`
              : 'Відгуків не знайдено'}
          </p>
        </div>

        {error && (
          <Card variant="glass" className="border-2 border-red-500/50">
            <CardContent className="pt-6 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={loadPendingReviews} variant="outline">
                Спробувати знову
              </Button>
            </CardContent>
          </Card>
        )}

        {reviews.length === 0 && !loading && (
          <Card variant="glass" className="border-2">
            <CardContent className="pt-6 text-center py-16">
              <p className="text-gray-400 text-lg">Відгуків не знайдено</p>
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card variant="glass" className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                          {review.user_name?.[0]?.toUpperCase() || 'А'}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {review.user_name || 'Анонімний користувач'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(review.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="mb-2">
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-sm text-gray-300">
                          Товар ID: <span className="font-mono text-xs">{review.product_id}</span>
                        </p>
                        {review.is_approved ? (
                          <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                            Схвалено
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                            На модерації
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                    {review.comment}
                  </p>
                  
                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    {!review.is_approved && (
                      <>
                        <Button
                          onClick={() => handleModerate(review.id, true)}
                          disabled={moderatingId === review.id}
                          variant="primary"
                          className="flex-1"
                        >
                          Схвалити
                        </Button>
                        <Button
                          onClick={() => handleModerate(review.id, false)}
                          disabled={moderatingId === review.id}
                          variant="outline"
                          className="flex-1"
                        >
                          Відхилити
                        </Button>
                      </>
                    )}
                    {review.is_approved && (
                      <Button
                        onClick={() => handleModerate(review.id, false)}
                        disabled={moderatingId === review.id}
                        variant="outline"
                        className="flex-1"
                      >
                        Відкликати схвалення
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(review.id)}
                      disabled={moderatingId === review.id}
                      variant="outline"
                      className="text-red-400 border-red-400/30 hover:bg-red-500/10"
                    >
                      Видалити
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

