"""
API endpoints для автентифікації.
"""
from datetime import timedelta
from fastapi import APIRouter, Depends
from loguru import logger
from pydantic import BaseModel, Field

from app.models.auth import LoginRequest, RegisterRequest, TokenResponse
from app.models.user import UserResponse
from app.services.auth_service import get_auth_service, AuthService
from app.core.exceptions import UnauthorizedError
from app.utils.security import decode_token, create_access_token
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


class RefreshTokenRequest(BaseModel):
    """Запит на оновлення токена."""
    refresh_token: str = Field(..., description="Refresh token")


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(
    user_data: RegisterRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Реєстрація нового користувача.
    """
    logger.info(f"Спроба реєстрації: {user_data.email}")
    
    # Створюємо користувача через UserCreate
    from app.models.user import UserCreate
    user_create = UserCreate(
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name,
        is_admin=False,  # За замовчуванням не адмін
    )
    
    # Створюємо користувача
    user = await auth_service.create_user(user_data=user_create)
    
    # Повертаємо відповідь без паролю
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        full_name=user["full_name"],
        is_admin=user.get("is_admin", False),
        created_at=user.get("created_at"),
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Вхід користувача. Повертає access та refresh токени.
    """
    logger.info(f"Спроба входу: {login_data.email}")
    
    tokens = await auth_service.login(
        email=login_data.email,
        password=login_data.password,
    )
    
    return tokens


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Оновлення access token за допомогою refresh token.
    """
    logger.info("Спроба оновлення токена")
    
    # Декодуємо refresh token
    token_data = decode_token(refresh_data.refresh_token, token_type="refresh")
    if token_data is None:
        raise UnauthorizedError("Невірний або прострочений refresh token")
    
    # Перевіряємо, чи користувач існує
    user = await auth_service.get_user_by_id(token_data.user_id)
    if not user:
        raise UnauthorizedError("Користувач не знайдений")
    
    # Створюємо новий access token
    new_token_data = {
        "sub": str(user["_id"]),
        "email": user["email"],
        "is_admin": user.get("is_admin", False),
    }
    
    access_token = create_access_token(
        new_token_data,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_data.refresh_token,  # Refresh token залишається незмінним
        token_type="bearer",
    )

