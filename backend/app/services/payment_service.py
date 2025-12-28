"""
Сервіс для симуляції оплати замовлень.
"""
from loguru import logger
import asyncio
from typing import Literal

from app.core.exceptions import ValidationError


PaymentStatus = Literal["success", "failed", "pending"]


class PaymentService:
    """Сервіс для симуляції оплати."""
    
    @staticmethod
    async def simulate_payment(order_id: str, amount: float) -> PaymentStatus:
        """
        Симулює процес оплати замовлення.
        Завжди повертає успіх для MVP (симуляція).
        
        В реальному застосунку тут була б інтеграція з платіжною системою.
        """
        logger.info(f"Симуляція оплати замовлення {order_id}, сума: {amount} UAH")
        
        # Симулюємо затримку обробки платежу (1-2 секунди)
        await asyncio.sleep(1)
        
        # Для MVP завжди повертаємо успіх
        # В реальному застосунку тут була б перевірка платежу через API платіжної системи
        logger.success(f"Оплата замовлення {order_id} успішно симульована")
        
        return "success"
    
    @staticmethod
    async def process_payment(order_id: str, amount: float) -> dict:
        """
        Обробляє платіж замовлення.
        Повертає результат обробки.
        """
        try:
            status = await PaymentService.simulate_payment(order_id, amount)
            
            return {
                "order_id": order_id,
                "status": status,
                "message": "Оплата успішно оброблена" if status == "success" else "Помилка оплати",
            }
        except Exception as e:
            logger.error(f"Помилка при обробці платежу для замовлення {order_id}: {str(e)}")
            raise ValidationError(f"Не вдалося обробити платіж: {str(e)}")


