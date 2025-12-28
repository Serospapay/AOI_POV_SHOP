"""
Конфігурація додатку PowerCore.
Використовує pydantic-settings для завантаження змінних оточення.
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List
import json


class Settings(BaseSettings):
    """Налаштування додатку з .env файлу."""
    
    # Загальні налаштування
    APP_NAME: str = "PowerCore API"
    APP_VERSION: str = "1.0.0"
    
    # MongoDB налаштування
    MONGODB_URL: str = "mongodb://localhost:27017/"
    MONGODB_DB_NAME: str = "powercore"
    
    # JWT налаштування
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS налаштування
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        """Парсить CORS_ORIGINS з JSON string або list."""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [v]
        return v
    
    # Логування
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/powercore.log"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Глобальний екземпляр settings
settings = Settings()

