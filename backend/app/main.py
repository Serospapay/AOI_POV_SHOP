"""
Головний файл FastAPI додатку PowerCore.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.core.config import settings
from app.core.database import MongoDB
from app.core.logging import setup_logging
from app.core.middleware import error_handler_middleware, logging_middleware


# Налаштовуємо логування
setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle events: підключення/відключення БД при старті/зупинці.
    """
    # Startup
    logger.info("Запуск PowerCore API...")
    try:
        await MongoDB.connect()
        logger.success("PowerCore API готовий до роботи")
    except Exception as e:
        logger.error(f"Помилка під час запуску: {str(e)}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Зупинка PowerCore API...")
    await MongoDB.disconnect()
    logger.info("PowerCore API зупинено")


# Створюємо FastAPI додаток
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API для інтернет-магазину пристроїв резервного живлення PowerCore",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Додаємо CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Додаємо custom middleware (важливо: порядок має значення)
app.middleware("http")(logging_middleware)
app.middleware("http")(error_handler_middleware)


@app.get("/")
async def root():
    """Кореневий endpoint для перевірки роботи API."""
    return {
        "message": "PowerCore API",
        "version": settings.APP_VERSION,
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Перевіряємо з'єднання з БД
        db = MongoDB.get_database()
        await db.client.admin.command("ping")
        return {
            "status": "healthy",
            "database": "connected",
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "database": "disconnected",
        }


# Підключаємо роути для API v1
from app.api.v1 import auth, products, search, orders, admin, reviews

app.include_router(auth.router, prefix="/api/v1")
app.include_router(products.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
app.include_router(orders.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(reviews.router, prefix="/api/v1")

