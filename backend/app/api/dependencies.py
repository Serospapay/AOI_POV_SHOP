"""
Dependencies для FastAPI endpoints (автентифікація, адмін права).
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from loguru import logger

from app.utils.security import decode_token
from app.services.auth_service import get_auth_service, AuthService
from app.core.exceptions import UnauthorizedError, ForbiddenError
from app.models.auth import TokenData

# HTTPBearer для отримання токена з заголовка Authorization
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service),
) -> TokenData:
    """
    Dependency для отримання поточного авторизованого користувача.
    """
    token = credentials.credentials
    token_data = decode_token(token, token_type="access")
    
    if token_data is None:
        raise UnauthorizedError("Невірний або прострочений токен")
    
    # Перевіряємо, чи користувач існує в БД
    user = await auth_service.get_user_by_id(token_data.user_id)
    if not user:
        raise UnauthorizedError("Користувач не знайдений")
    
    return token_data


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    auth_service: AuthService = Depends(get_auth_service),
) -> Optional[TokenData]:
    """
    Dependency для отримання поточного користувача (опціонально).
    Не вимагає авторизації - повертає None якщо токен відсутній або невалідний.
    """
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        token_data = decode_token(token, token_type="access")
        
        if token_data is None:
            return None
        
        # Перевіряємо, чи користувач існує в БД
        user = await auth_service.get_user_by_id(token_data.user_id)
        if not user:
            return None
        
        return token_data
    except Exception as e:
        logger.debug(f"Помилка при отриманні користувача (опціонально): {e}")
        return None


async def get_current_admin(
    current_user: TokenData = Depends(get_current_user),
) -> TokenData:
    """
    Dependency для отримання поточного адміністратора.
    Перевіряє, чи користувач має права адміністратора.
    """
    if not current_user.is_admin:
        raise ForbiddenError("Потрібні права адміністратора")
    
    return current_user


