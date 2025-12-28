"""
Middleware для обробки помилок та логування запитів.
"""
import time
from typing import Callable
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from loguru import logger
from app.core.exceptions import PowerCoreException
from app.core.database import get_database_error_message


async def error_handler_middleware(request: Request, call_next: Callable) -> Response:
    """
    Глобальний обробник помилок.
    Ніколи не показує клієнту 500 Internal Server Error, завжди красиве повідомлення.
    """
    try:
        response = await call_next(request)
        return response
    except PowerCoreException as e:
        # Кастомні винятки з красивими повідомленнями
        logger.warning(f"PowerCoreException: {e.detail} | Path: {request.url.path}")
        return JSONResponse(
            status_code=e.status_code,
            content={
                "success": False,
                "error": {
                    "message": e.detail,
                    "type": e.__class__.__name__,
                },
            },
        )
    except Exception as e:
        # Всі інші помилки - логуємо детально, клієнту показуємо загальне повідомлення
        logger.error(
            f"Невідома помилка: {str(e)} | Path: {request.url.path} | Method: {request.method}",
            exc_info=True,
        )
        
        # Перевіряємо, чи це помилка БД
        db_error_msg = get_database_error_message(str(e))
        if db_error_msg:
            error_message = db_error_msg
        else:
            error_message = "Сталася несподівана помилка. Спробуйте пізніше."
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": {
                    "message": error_message,
                    "type": "InternalServerError",
                },
            },
        )


async def logging_middleware(request: Request, call_next: Callable) -> Response:
    """
    Middleware для логування всіх запитів.
    """
    start_time = time.time()
    
    # Логуємо вхідний запит
    logger.info(
        f"→ {request.method} {request.url.path} | "
        f"Client: {request.client.host if request.client else 'Unknown'}"
    )
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Логуємо успішну відповідь
        logger.info(
            f"← {request.method} {request.url.path} | "
            f"Status: {response.status_code} | "
            f"Time: {process_time:.3f}s"
        )
        
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(
            f"✗ {request.method} {request.url.path} | "
            f"Error: {str(e)} | "
            f"Time: {process_time:.3f}s"
        )
        raise


