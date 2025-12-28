"""
Pydantic моделі для відгуків (Reviews).
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId as BsonObjectId

class PyObjectId(str):
    """Кастомний клас для ObjectId з валідацією Pydantic v2."""
    
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        from pydantic_core import core_schema
        
        def validate_from_str(value):
            if isinstance(value, BsonObjectId):
                return value
            if isinstance(value, str) and BsonObjectId.is_valid(value):
                return BsonObjectId(value)
            raise ValueError("Invalid ObjectId")
        
        return core_schema.no_info_plain_validator_function(
            validate_from_str,
            serialization=core_schema.str_schema(),
        )


class ReviewBase(BaseModel):
    """Базова модель відгуку."""
    
    product_id: str = Field(..., description="ID товару")
    rating: float = Field(..., ge=1.0, le=5.0, description="Оцінка від 1 до 5")
    comment: str = Field(..., min_length=10, max_length=2000, description="Текст відгуку")
    user_name: Optional[str] = Field(None, max_length=100, description="Ім'я користувача (для неавторизованих)")


class ReviewCreate(ReviewBase):
    """Модель для створення відгуку."""
    pass


class ReviewUpdate(BaseModel):
    """Модель для оновлення відгуку."""
    
    rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    comment: Optional[str] = Field(None, min_length=10, max_length=2000)
    is_approved: Optional[bool] = Field(None, description="Чи схвалено модератором")


class Review(ReviewBase):
    """Модель відгуку з ID та датами."""
    
    id: PyObjectId = Field(default_factory=lambda: BsonObjectId(), alias="_id")
    user_id: Optional[str] = Field(None, description="ID користувача (якщо авторизований)")
    is_approved: bool = Field(default=False, description="Чи схвалено модератором")
    is_moderated: bool = Field(default=False, description="Чи перевірено модератором")
    moderator_comment: Optional[str] = Field(None, max_length=500, description="Коментар модератора")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}


class ReviewResponse(BaseModel):
    """Модель для відповіді API з відгуком."""
    
    id: str
    product_id: str
    user_id: Optional[str]
    user_name: Optional[str]
    rating: float
    comment: str
    is_approved: bool
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True

