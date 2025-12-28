"""
Утиліти для безпеки: JWT токени та хешування паролів.
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from loguru import logger

from app.core.config import settings
from app.models.auth import TokenData


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Перевіряє чи відповідає пароль хешу.
    Використовує bcrypt безпосередньо для сумісності.
    """
    try:
        # Конвертуємо hashed_password в bytes якщо це строка
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        if isinstance(plain_password, str):
            plain_password = plain_password.encode('utf-8')
        
        return bcrypt.checkpw(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Помилка перевірки пароля: {str(e)}")
        return False


def get_password_hash(password: str) -> str:
    """
    Хешує пароль використовуючи bcrypt.
    Повертає строку (хеш буде автоматично конвертовано в строку).
    """
    # Конвертуємо пароль в bytes
    if isinstance(password, str):
        password = password.encode('utf-8')
    
    # Генеруємо сіль та хешуємо
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password, salt)
    
    # Повертаємо як строку
    return hashed.decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Створює JWT access token.
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """
    Створює JWT refresh token.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str, token_type: str = "access") -> Optional[TokenData]:
    """
    Декодує JWT token і повертає TokenData або None.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        # Перевіряємо тип токена
        if payload.get("type") != token_type:
            logger.warning(f"Невірний тип токена. Очікувався {token_type}, отримано {payload.get('type')}")
            return None
        
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        is_admin: bool = payload.get("is_admin", False)
        
        if user_id is None or email is None:
            return None
        
        return TokenData(user_id=user_id, email=email, is_admin=is_admin)
    except JWTError as e:
        logger.warning(f"Помилка декодування токена: {str(e)}")
        return None
