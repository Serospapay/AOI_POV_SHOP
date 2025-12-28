"""
Сервіс для роботи з замовленнями.
"""
from typing import List, Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from bson.errors import InvalidId
from loguru import logger

from app.core.database import MongoDB
from app.models.order import OrderCreate, Order
from app.models.product import Product
from app.services.product_service import get_product_service
from app.core.exceptions import NotFoundError, DatabaseError, ValidationError


class OrderService:
    """Сервіс для управління замовленнями."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.orders
    
    @staticmethod
    def _calculate_delivery_cost(items_total: float, delivery_method: str) -> float:
        """
        Розраховує вартість доставки залежно від методу та суми замовлення.
        """
        # Безкоштовна доставка від 2000 грн для кур'єра та пошти
        if items_total >= 2000 and delivery_method in ["courier", "post"]:
            return 0.0
        
        # Вартість доставки за методом
        delivery_costs = {
            "courier": 150.0,  # Кур'єрська доставка
            "post": 80.0,      # Пошта
            "pickup": 0.0,     # Самовивіз безкоштовно
        }
        
        return delivery_costs.get(delivery_method, 150.0)
    
    async def create_order(self, order_data: OrderCreate) -> dict:
        """
        Створює нове замовлення.
        Перевіряє наявність товарів та підраховує загальну суму.
        """
        try:
            # Отримуємо product_service
            from app.services.product_service import get_product_service
            product_service = get_product_service()
            total_amount = 0.0
            validated_items = []
            
            # Перевіряємо кожен товар в замовленні
            for item in order_data.items:
                # Отримуємо товар з БД
                product = await product_service.get_product_by_id(item.product_id)
                if not product:
                    raise NotFoundError("Товар", item.product_id)
                
                # Перевіряємо наявність на складі
                if product.get("stock", 0) < item.quantity:
                    raise ValidationError(
                        f"Недостатньо товару '{product['name']}' на складі. "
                        f"Доступно: {product.get('stock', 0)}, потрібно: {item.quantity}"
                    )
                
                # Перевіряємо, чи товар активний
                if not product.get("is_active", False):
                    raise ValidationError(f"Товар '{product['name']}' не доступний для замовлення")
                
                # Підраховуємо суму
                item_total = item.price * item.quantity
                total_amount += item_total
                
                validated_items.append({
                    "product_id": item.product_id,
                    "product_name": product["name"],
                    "quantity": item.quantity,
                    "price": item.price,
                })
            
            # Розраховуємо вартість доставки
            delivery_cost = self._calculate_delivery_cost(
                total_amount,
                order_data.delivery_method
            )
            
            # Створюємо документ замовлення
            order_doc = {
                "user_id": order_data.user_id if order_data.user_id else None,  # Може бути None для неавторизованих
                "items": validated_items,
                "address": order_data.address.model_dump(),
                "email": order_data.email,
                "notes": order_data.notes,
                "payment_method": getattr(order_data, 'payment_method', 'card'),
                "delivery_method": getattr(order_data, 'delivery_method', 'courier'),
                "delivery_cost": delivery_cost,
                "payment_status": "pending",  # За замовчуванням очікує оплати
                "order_status": "new",  # Новий статус
                "total_amount": total_amount + delivery_cost,
                "items_total": total_amount,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
            
            result = await self.collection.insert_one(order_doc)
            created_order = await self.collection.find_one({"_id": result.inserted_id})
            
            logger.info(f"Створено замовлення: ID {result.inserted_id}, сума: {total_amount + delivery_cost} UAH")
            
            return self._serialize_order(created_order)
            
        except (NotFoundError, ValidationError):
            raise
        except Exception as e:
            logger.error(f"Помилка при створенні замовлення: {str(e)}")
            raise DatabaseError(f"Не вдалося створити замовлення: {str(e)}")
    
    @staticmethod
    def _serialize_order(order: dict) -> dict:
        """
        Конвертує Mongo документ у серіалізований dict з id та iso-датами.
        """
        if not order:
            return order

        serialized = dict(order)

        if "_id" in serialized:
            serialized["id"] = str(serialized["_id"])
            del serialized["_id"]

        for dt_key in ("created_at", "updated_at"):
            if dt_key in serialized and isinstance(serialized[dt_key], datetime):
                serialized[dt_key] = serialized[dt_key].isoformat()
        
        # Забезпечуємо наявність полів
        serialized["items_total"] = serialized.get("items_total", serialized.get("total_amount", 0))
        serialized["delivery_cost"] = serialized.get("delivery_cost", 0.0)
        serialized["payment_method"] = serialized.get("payment_method", "card")
        serialized["delivery_method"] = serialized.get("delivery_method", "courier")
        # user_id може бути None для неавторизованих користувачів
        if "user_id" not in serialized:
            serialized["user_id"] = None

        return serialized

    async def get_order_by_id(self, order_id: str) -> Optional[dict]:
        """
        Отримує замовлення за ID.
        """
        try:
            order = await self.collection.find_one({"_id": ObjectId(order_id)})
            return self._serialize_order(order) if order else None
        except (InvalidId, Exception) as e:
            logger.warning(f"Помилка при пошуку замовлення за ID {order_id}: {str(e)}")
            return None
    
    async def get_orders_by_user(self, user_id: str, limit: int = 50) -> List[dict]:
        """
        Отримує замовлення користувача.
        """
        try:
            cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
            orders_raw = await cursor.to_list(length=limit)
            return [self._serialize_order(order) for order in orders_raw]
        except Exception as e:
            logger.error(f"Помилка при отриманні замовлень користувача {user_id}: {str(e)}")
            raise DatabaseError(f"Не вдалося отримати замовлення: {str(e)}")
    
    async def get_all_orders(self, limit: int = 100) -> List[dict]:
        """
        Отримує всі замовлення (для адміністраторів).
        """
        try:
            cursor = self.collection.find({}).sort("created_at", -1).limit(limit)
            orders_raw = await cursor.to_list(length=limit)
            return [self._serialize_order(order) for order in orders_raw]
        except Exception as e:
            logger.error(f"Помилка при отриманні всіх замовлень: {str(e)}")
            raise DatabaseError(f"Не вдалося отримати замовлення: {str(e)}")
    
    async def update_order_status(
        self,
        order_id: str,
        order_status: Optional[str] = None,
        payment_status: Optional[str] = None,
    ) -> dict:
        """
        Оновлює статус замовлення.
        """
        try:
            # Перевіряємо існування замовлення
            existing_order_raw = await self.collection.find_one({"_id": ObjectId(order_id)})
            if not existing_order_raw:
                raise NotFoundError("Замовлення", order_id)
            
            update_data = {"updated_at": datetime.utcnow()}
            
            if order_status:
                update_data["order_status"] = order_status
            if payment_status:
                update_data["payment_status"] = payment_status
            
            await self.collection.update_one(
                {"_id": ObjectId(order_id)},
                {"$set": update_data}
            )
            
            updated_order_raw = await self.collection.find_one({"_id": ObjectId(order_id)})
            updated_order = self._serialize_order(updated_order_raw) if updated_order_raw else None
            logger.info(f"Оновлено статус замовлення {order_id}")
            
            return updated_order
            
        except NotFoundError:
            raise
        except (InvalidId, Exception) as e:
            logger.error(f"Помилка при оновленні статусу замовлення {order_id}: {str(e)}")
            raise DatabaseError(f"Не вдалося оновити статус замовлення: {str(e)}")


def get_order_service() -> OrderService:
    """Отримує екземпляр OrderService."""
    db = MongoDB.get_database()
    return OrderService(db)

