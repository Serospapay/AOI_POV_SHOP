"""
Скрипт для оновлення пароля адміна.
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import MongoDB
from app.services.auth_service import AuthService
from app.utils.security import get_password_hash
from loguru import logger


async def update_admin_password():
    """Оновлює пароль адміна."""
    try:
        await MongoDB.connect()
        logger.info("Підключено до MongoDB")

        db = MongoDB.get_database()
        users_collection = db.users
        
        # Знаходимо адміна
        admin = await users_collection.find_one({"email": "admin@powercore.com"})
        if not admin:
            logger.error("Адмін користувач не знайдений")
            return
        
        # Оновлюємо пароль
        new_password_hash = get_password_hash("admin12345")
        await users_collection.update_one(
            {"email": "admin@powercore.com"},
            {"$set": {"hashed_password": new_password_hash}}
        )
        
        logger.success("Пароль адміна оновлено на: admin12345")

    except Exception as e:
        logger.error(f"Помилка: {e}")
        raise
    finally:
        await MongoDB.disconnect()
        logger.info("Відключено від MongoDB")


if __name__ == "__main__":
    asyncio.run(update_admin_password())

