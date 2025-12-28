"""
Налаштування Loguru для професійного логування.
"""
import sys
from pathlib import Path
from loguru import logger
from app.core.config import settings


def setup_logging():
    """
    Налаштовує Loguru для логування у файл та консоль.
    """
    # Видаляємо стандартний handler
    logger.remove()
    
    # Створюємо директорію для логів
    log_path = Path(settings.LOG_FILE)
    log_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Додаємо консольний handler з кольоровим виводом
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level=settings.LOG_LEVEL,
        colorize=True,
    )
    
    # Додаємо файловий handler з ротацією
    logger.add(
        settings.LOG_FILE,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level=settings.LOG_LEVEL,
        rotation="10 MB",  # Ротація при досягненні 10MB
        retention="30 days",  # Зберігати логи 30 днів
        compression="zip",  # Стискати старі логи
        backtrace=True,  # Показувати повний traceback
        diagnose=True,  # Детальна діагностика
    )
    
    logger.info("Logging налаштовано успішно")
    return logger


