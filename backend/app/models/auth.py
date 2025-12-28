"""
Pydantic моделі для автентифікації.
"""
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Запит на вхід."""
    
    email: EmailStr = Field(..., description="Email користувача")
    password: str = Field(..., description="Пароль")


class RegisterRequest(BaseModel):
    """Запит на реєстрацію."""
    
    email: EmailStr = Field(..., description="Email користувача")
    password: str = Field(..., min_length=8, description="Пароль (мінімум 8 символів)")
    full_name: str = Field(..., min_length=1, max_length=100, description="Повне ім'я")


class TokenResponse(BaseModel):
    """Відповідь з токенами доступу."""
    
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Тип токена")


class TokenData(BaseModel):
    """Дані з токена."""
    
    user_id: str
    email: str
    is_admin: bool


