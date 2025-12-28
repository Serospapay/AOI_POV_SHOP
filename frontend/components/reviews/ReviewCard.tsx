/**
 * Компонент картки відгуку
 */

'use client';

import { StarRating } from '@/components/catalog/StarRating';
import type { Review } from '@/types/review';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';

interface ReviewCardProps {
  review: Review;
  onUpdate?: () => void;
}

export function ReviewCard({ review, onUpdate }: ReviewCardProps) {
  const { user } = useAuth();
  const isOwnReview = user && review.user_id && review.user_id === user.id;

  return (
    <div className="bg-glass rounded-xl p-4 border-2 border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between mb-3">
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
        </div>
      </div>
      
      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
        {review.comment}
      </p>

      {isOwnReview && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <span className="text-xs text-primary">Ваш відгук</span>
        </div>
      )}
    </div>
  );
}

