"""
Кастомні винятки для PowerCore API.
"""
from fastapi import HTTPException, status


class PowerCoreException(HTTPException):
    """Базовий клас для всіх кастомних винятків."""
    
    def __init__(
        self,
        status_code: int,
        detail: str,
        headers: dict | None = None,
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)


class NotFoundError(PowerCoreException):
    """Ресурс не знайдено."""
    
    def __init__(self, resource: str = "Ресурс", resource_id: str | None = None):
        detail = f"{resource} не знайдено"
        if resource_id:
            detail += f" (ID: {resource_id})"
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class ValidationError(PowerCoreException):
    """Помилка валідації даних."""
    
    def __init__(self, detail: str = "Невірні дані"):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)


class UnauthorizedError(PowerCoreException):
    """Помилка авторизації."""
    
    def __init__(self, detail: str = "Необхідна авторизація"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class ForbiddenError(PowerCoreException):
    """Немає доступу."""
    
    def __init__(self, detail: str = "Немає доступу до цього ресурсу"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class ConflictError(PowerCoreException):
    """Конфлікт даних (наприклад, користувач вже існує)."""
    
    def __init__(self, detail: str = "Конфлікт даних"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class DatabaseError(PowerCoreException):
    """Помилка роботи з базою даних."""
    
    def __init__(self, detail: str = "Помилка роботи з базою даних"):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)


