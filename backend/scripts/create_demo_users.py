"""
Скрипт для створення демо користувачів в БД.
Запускається: python -m scripts.create_demo_users
"""

import asyncio
import sys
from pathlib import Path

# Додаємо корінь проекту до шляху
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import MongoDB
from app.services.auth_service import AuthService
from app.models.user import UserCreate
from loguru import logger


async def create_demo_users():
    """Створює демо користувачів."""
    try:
        # Підключаємося до БД
        await MongoDB.connect()
        logger.info("Підключено до MongoDB")

        auth_service = AuthService(MongoDB.get_database())

        demo_users = [
            {
                "email": "demo@powercore.com",
                "password": "demo12345",
                "full_name": "Demo User",
                "is_admin": False,
            },
            {
                "email": "admin@powercore.com",
                "password": "admin12345",
                "full_name": "Admin User",
                "is_admin": True,
            },
        ]

        created_count = 0
        skipped_count = 0

        for user_data in demo_users:
            try:
                # Перевіряємо чи існує користувач
                existing = await auth_service.get_user_by_email(user_data["email"])
                if existing:
                    logger.warning(f"Користувач {user_data['email']} вже існує, пропускаємо")
                    skipped_count += 1
                    continue

                # Створюємо користувача
                user_create = UserCreate(**user_data)
                await auth_service.create_user(user_create)
                logger.success(f"Створено користувача: {user_data['email']} (admin: {user_data['is_admin']})")
                created_count += 1
            except Exception as e:
                logger.error(f"Помилка при створенні користувача {user_data['email']}: {e}")

        logger.info(f"Готово! Створено: {created_count}, пропущено: {skipped_count}")

    except Exception as e:
        logger.error(f"Критична помилка: {e}")
        raise
    finally:
        await MongoDB.disconnect()
        logger.info("Відключено від MongoDB")


if __name__ == "__main__":
    asyncio.run(create_demo_users())

