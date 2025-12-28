/**
 * Компонент рейтингу зі зірками
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number; // 0-5
  ratingCount?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function StarRating({ 
  rating, 
  ratingCount, 
  interactive = false, 
  onRate,
  size = 'md',
  className 
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  
  const sizeClasses = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const displayRating = hoveredRating ?? rating;
  const fullStars = Math.floor(displayRating);
  const hasHalfStar = displayRating % 1 >= 0.5;
  
  const handleClick = (value: number) => {
    if (interactive && onRate) {
      onRate(value);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFull = star <= fullStars;
          const isHalf = star === fullStars + 1 && hasHalfStar;
          const isHovered = hoveredRating !== null && star <= hoveredRating;
          
          return (
            <button
              key={star}
              type="button"
              onClick={() => handleClick(star)}
              onMouseEnter={() => interactive && setHoveredRating(star)}
              onMouseLeave={() => interactive && setHoveredRating(null)}
              disabled={!interactive}
              className={cn(
                sizeClasses[size],
                'transition-all',
                interactive && 'cursor-pointer hover:scale-110',
                !interactive && 'cursor-default'
              )}
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={cn(
                  'w-full h-full',
                  isFull || isHalf ? 'text-primary' : 'text-gray-600'
                )}
              >
                {isFull ? (
                  <path
                    d="M10 15L4.5 18l1-5.5L2 8l5.5-.5L10 2l2.5 5.5L18 8l-3.5 4.5 1 5.5-5.5-3z"
                    fill="currentColor"
                  />
                ) : isHalf ? (
                  <>
                    <path
                      d="M10 2l2.5 5.5L18 8l-3.5 4.5 1 5.5-5.5-3V2z"
                      fill="currentColor"
                    />
                    <path
                      d="M10 2L7.5 7.5 2 8l3.5 4.5-1 5.5L10 15V2z"
                      fill="currentColor"
                      className="opacity-30"
                    />
                  </>
                ) : (
                  <path
                    d="M10 15L4.5 18l1-5.5L2 8l5.5-.5L10 2l2.5 5.5L18 8l-3.5 4.5 1 5.5-5.5-3z"
                    fill="currentColor"
                    className="opacity-20"
                  />
                )}
              </svg>
            </button>
          );
        })}
      </div>
      {ratingCount !== undefined && ratingCount > 0 && size !== 'xs' && (
        <span className="text-[10px] text-gray-400 ml-0.5">
          ({ratingCount})
        </span>
      )}
      {rating > 0 && size === 'xs' && (
        <span className="text-[10px] text-gray-400 ml-0.5">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

