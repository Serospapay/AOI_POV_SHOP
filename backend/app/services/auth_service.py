"""
Сервіс для автентифікації та роботи з користувачами.
"""
from typing import Optional
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
from loguru import logger
from bson import ObjectId

from app.core.database import MongoDB
from app.models.user import User, UserCreate, UserResponse
from app.models.auth import TokenResponse
from app.utils.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
)
from app.core.exceptions import UnauthorizedError, ConflictError, NotFoundError
from app.core.config import settings


class AuthService:
    """Сервіс для автентифікації."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.users
    
    async def get_user_by_email(self, email: str) -> Optional[dict]:
        """Знаходить користувача за email."""
        user = await self.collection.find_one({"email": email})
        return user
    
    async def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """Знаходить користувача за ID."""
        try:
            user = await self.collection.find_one({"_id": ObjectId(user_id)})
            return user
        except Exception as e:
            logger.error(f"Помилка при пошуку користувача за ID: {str(e)}")
            return None
    
    async def create_user(self, user_data: UserCreate) -> dict:
        """
        Створює нового користувача.
        """
        # Перевіряємо, чи не існує вже користувач з таким email
        existing_user = await self.get_user_by_email(user_data.email)
        if existing_user:
            raise ConflictError(f"Користувач з email {user_data.email} вже існує")
        
        # Хешуємо пароль
        hashed_password = get_password_hash(user_data.password)
        
        # Створюємо документ користувача
        now = datetime.utcnow()
        user_doc = {
            "email": user_data.email,
            "full_name": user_data.full_name,
            "hashed_password": hashed_password,
            "is_admin": user_data.is_admin,
            "created_at": now,
            "updated_at": now,
        }
        
        # Вставляємо в БД
        result = await self.collection.insert_one(user_doc)
        
        # Отримуємо створеного користувача
        created_user = await self.collection.find_one({"_id": result.inserted_id})
        logger.info(f"Створено нового користувача: {user_data.email}")
        
        return created_user
    
    async def authenticate_user(self, email: str, password: str) -> Optional[dict]:
        """
        Автентифікує користувача за email та паролем.
        Повертає користувача або None.
        """
        user = await self.get_user_by_email(email)
        if not user:
            return None
        
        if not verify_password(password, user["hashed_password"]):
            return None
        
        return user
    
    async def login(self, email: str, password: str) -> TokenResponse:
        """
        Виконує вхід користувача та повертає токени.
        """
        user = await self.authenticate_user(email, password)
        if not user:
            raise UnauthorizedError("Невірний email або пароль")
        
        # Створюємо токени
        token_data = {
            "sub": str(user["_id"]),
            "email": user["email"],
            "is_admin": user.get("is_admin", False),
        }
        
        access_token = create_access_token(
            token_data,
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )
        refresh_token = create_refresh_token(token_data)
        
        logger.info(f"Користувач {email} успішно увійшов в систему")
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
        )


# Глобальний екземпляр сервісу (буде ініціалізовано після підключення БД)
def get_auth_service() -> AuthService:
    """Отримує екземпляр AuthService."""
    db = MongoDB.get_database()
    return AuthService(db)

