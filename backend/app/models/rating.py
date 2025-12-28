"""
Pydantic моделі для рейтингів товарів.
"""
from pydantic import BaseModel, Field
from typing import Optional


class RatingCreate(BaseModel):
    """Модель для створення оцінки."""
    product_id: str = Field(..., description="ID товару")
    rating: float = Field(..., ge=1.0, le=5.0, description="Оцінка від 1 до 5")
    comment: Optional[str] = Field(None, max_length=1000, description="Коментар (опціонально)")


class RatingResponse(BaseModel):
    """Модель відповіді з рейтингом."""
    product_id: str
    rating: float
    rating_count: int
    comment: Optional[str] = None

