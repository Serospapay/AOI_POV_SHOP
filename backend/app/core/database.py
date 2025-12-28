"""
Підключення до MongoDB через Motor (async driver).
З retry-логікою для стійкості.
"""
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from loguru import logger
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)
from app.core.config import settings


class MongoDB:
    """Клас для управління з'єднанням з MongoDB."""
    
    client: Optional[AsyncIOMotorClient] = None
    database = None
    
    @classmethod
    @retry(
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((ConnectionFailure, ServerSelectionTimeoutError)),
    )
    async def connect(cls):
        """Підключення до MongoDB з retry-логікою."""
        try:
            logger.info(f"Підключення до MongoDB: {settings.MONGODB_URL}")
            cls.client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=5000,  # 5 секунд таймаут
            )
            # Перевіряємо з'єднання
            await cls.client.admin.command("ping")
            cls.database = cls.client[settings.MONGODB_DB_NAME]
            logger.success(f"Успішно підключено до MongoDB: {settings.MONGODB_DB_NAME}")
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"Помилка підключення до MongoDB: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Невідома помилка підключення до MongoDB: {str(e)}")
            raise
    
    @classmethod
    async def disconnect(cls):
        """Відключення від MongoDB."""
        if cls.client:
            cls.client.close()
            logger.info("Відключено від MongoDB")
    
    @classmethod
    def get_database(cls):
        """Отримання екземпляру бази даних."""
        if cls.database is None:
            raise RuntimeError("База даних не підключена. Викличте connect() спочатку.")
        return cls.database


def get_database_error_message(error_message: str) -> Optional[str]:
    """
    Визначає, чи це помилка БД, і повертає зрозуміле повідомлення для клієнта.
    """
    db_errors = [
        "ConnectionFailure",
        "ServerSelectionTimeoutError",
        "connection",
        "timeout",
        "network",
    ]
    
    error_lower = error_message.lower()
    for db_error in db_errors:
        if db_error.lower() in error_lower:
            return "Тимчасові проблеми з базою даних. Спробуйте пізніше."
    
    return None

