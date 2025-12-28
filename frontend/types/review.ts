/**
 * Типи для відгуків
 */

export interface Review {
  id: string;
  product_id: string;
  user_id?: string;
  user_name?: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewCreate {
  product_id: string;
  rating: number;
  comment: string;
  user_name?: string;
}

