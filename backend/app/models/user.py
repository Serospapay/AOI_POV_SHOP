"""
Pydantic моделі для користувачів (User).
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId
from app.models.product import PyObjectId


class UserBase(BaseModel):
    """Базова модель користувача."""
    
    email: EmailStr = Field(..., description="Email користувача")
    full_name: str = Field(..., min_length=1, max_length=100, description="Повне ім'я")
    is_admin: bool = Field(default=False, description="Чи є адміністратором")


class UserCreate(UserBase):
    """Модель для створення користувача."""
    
    password: str = Field(..., min_length=8, description="Пароль (мінімум 8 символів)")


class UserUpdate(BaseModel):
    """Модель для оновлення користувача."""
    
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    password: Optional[str] = Field(None, min_length=8)


class User(UserBase):
    """Модель користувача з ID та датами."""
    
    id: PyObjectId = Field(default_factory=lambda: ObjectId(), alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


class UserResponse(UserBase):
    """Модель для відповіді API (без паролю)."""
    
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

