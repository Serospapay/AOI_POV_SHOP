"""
Сервіс для роботи з товарами (CRUD операції).
"""
from typing import List, Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from bson.errors import InvalidId
from loguru import logger

from app.core.database import MongoDB
from app.models.product import ProductCreate, ProductUpdate, Product
from app.models.common import PaginationParams, ProductFilters
from app.core.exceptions import NotFoundError, DatabaseError, ValidationError


class ProductService:
    """Сервіс для управління товарами."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.products

    @staticmethod
    def _serialize_product(product: dict) -> dict:
        """
        Конвертує Mongo документ у серіалізований dict з id та iso-датами.
        """
        if not product:
            return product

        serialized = {}
        
        for key, value in product.items():
            # Обробляємо _id окремо
            if key == "_id":
                serialized["id"] = str(value)
            # Обробляємо datetime
            elif isinstance(value, datetime):
                serialized[key] = value.isoformat()
            # Обробляємо ObjectId (якщо залишився десь)
            elif isinstance(value, ObjectId):
                serialized[key] = str(value)
            # Обробляємо вкладені dict
            elif isinstance(value, dict):
                serialized[key] = ProductService._serialize_product(value)
            # Всі інші типи залишаємо як є
            else:
                serialized[key] = value

        return serialized
    
    async def rate_product(self, product_id: str, rating: float) -> dict:
        """
        Додає оцінку товару та оновлює середній рейтинг.
        """
        try:
            if not ObjectId.is_valid(product_id):
                raise ValidationError(f"Невірний ID товару: {product_id}")
            
            product = await self.collection.find_one({"_id": ObjectId(product_id)})
            if not product:
                raise NotFoundError("Товар", product_id)
            
            current_rating = product.get("rating", 0.0)
            current_count = product.get("rating_count", 0)
            
            # Обчислюємо новий середній рейтинг
            new_count = current_count + 1
            new_rating = ((current_rating * current_count) + rating) / new_count
            
            # Оновлюємо товар
            await self.collection.update_one(
                {"_id": ObjectId(product_id)},
                {
                    "$set": {
                        "rating": round(new_rating, 2),
                        "rating_count": new_count,
                        "updated_at": datetime.utcnow(),
                    }
                }
            )
            
            # Повертаємо оновлений товар
            updated_product = await self.collection.find_one({"_id": ObjectId(product_id)})
            return self._serialize_product(updated_product)
            
        except InvalidId:
            raise ValidationError(f"Невірний ID товару: {product_id}")
        except Exception as e:
            logger.error(f"Помилка при оцінюванні товару {product_id}: {e}")
            raise DatabaseError(f"Не вдалося оцінити товар: {str(e)}")
    
    async def create_product(self, product_data: ProductCreate) -> dict:
        """
        Створює новий товар.
        """
        try:
            product_doc = {
                "name": product_data.name,
                "description": product_data.description,
                "price": product_data.price,
                "image_url": product_data.image_url,
                "capacity": product_data.capacity,
                "power": product_data.power,
                "battery_type": product_data.battery_type,
                "brand": product_data.brand,
                "category": product_data.category,
                "weight": product_data.weight,
                "dimensions": product_data.dimensions,
                "stock": product_data.stock,
                "is_active": product_data.is_active,
                "rating": product_data.rating,
                "rating_count": product_data.rating_count,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
            
            result = await self.collection.insert_one(product_doc)
            created_product = await self.collection.find_one({"_id": result.inserted_id})
            
            logger.info(f"Створено товар: {product_data.name} (ID: {result.inserted_id})")
            return self._serialize_product(created_product)
            
        except Exception as e:
            logger.error(f"Помилка при створенні товару: {str(e)}")
            raise DatabaseError(f"Не вдалося створити товар: {str(e)}")
    
    async def get_product_by_id(self, product_id: str) -> Optional[dict]:
        """
        Отримує товар за ID.
        """
        try:
            product = await self.collection.find_one({"_id": ObjectId(product_id)})
            return self._serialize_product(product)
        except (InvalidId, Exception) as e:
            logger.warning(f"Помилка при пошуку товару за ID {product_id}: {str(e)}")
            return None
    
    async def get_products(
        self,
        pagination: PaginationParams,
        filters: Optional[ProductFilters] = None,
        only_active: bool = True,
    ) -> tuple[List[dict], int]:
        """
        Отримує список товарів з пагінацією та фільтрами.
        Повертає (список товарів, загальна кількість).
        """
        try:
            # Формуємо query
            query = {}
            
            # Фільтр по активності
            if only_active:
                query["is_active"] = True
            
            # Додаємо фільтри
            if filters:
                filter_query = filters.to_mongo_query()
                query.update(filter_query)
            
            # Підрахунок загальної кількості
            total = await self.collection.count_documents(query)
            
            # Отримуємо товари з пагінацією
            cursor = self.collection.find(query).skip(pagination.skip).limit(pagination.limit).sort("created_at", -1)
            products_raw = await cursor.to_list(length=pagination.limit)
            products = [self._serialize_product(p) for p in products_raw]
            
            return products, total
            
        except Exception as e:
            logger.error(f"Помилка при отриманні товарів: {str(e)}")
            raise DatabaseError(f"Не вдалося отримати товари: {str(e)}")
    
    async def update_product(self, product_id: str, product_data: ProductUpdate) -> dict:
        """
        Оновлює товар.
        """
        try:
            # Перевіряємо, чи існує товар
            existing_product = await self.get_product_by_id(product_id)
            if not existing_product:
                raise NotFoundError("Товар", product_id)
            
            # Формуємо дані для оновлення (тільки поля, які передані)
            update_data = product_data.model_dump(exclude_unset=True)
            
            if not update_data:
                # Якщо немає даних для оновлення, повертаємо існуючий товар
                return existing_product
            
            # Додаємо updated_at
            update_data["updated_at"] = datetime.utcnow()
            
            # Оновлюємо
            await self.collection.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": update_data}
            )
            
            # Отримуємо оновлений товар
            updated_product = await self.get_product_by_id(product_id)
            logger.info(f"Оновлено товар: {product_id}")
            
            return updated_product
            
        except NotFoundError:
            raise
        except (InvalidId, Exception) as e:
            logger.error(f"Помилка при оновленні товару {product_id}: {str(e)}")
            raise DatabaseError(f"Не вдалося оновити товар: {str(e)}")
    
    async def delete_product(self, product_id: str) -> bool:
        """
        Видаляє товар (soft delete - встановлює is_active = False).
        """
        try:
            existing_product = await self.get_product_by_id(product_id)
            if not existing_product:
                raise NotFoundError("Товар", product_id)
            
            # Soft delete
            await self.collection.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
            )
            
            logger.info(f"Видалено товар (soft delete): {product_id}")
            return True
            
        except NotFoundError:
            raise
        except (InvalidId, Exception) as e:
            logger.error(f"Помилка при видаленні товару {product_id}: {str(e)}")
            raise DatabaseError(f"Не вдалося видалити товар: {str(e)}")
    
    async def search_products(self, search_query: str, limit: int = 20) -> List[dict]:
        """
        Пошук товарів за назвою та описом.
        """
        try:
            if not search_query or not search_query.strip():
                return []
            
            # Формуємо query для текстового пошуку
            query = {
                "is_active": True,
                "$or": [
                    {"name": {"$regex": search_query, "$options": "i"}},
                    {"description": {"$regex": search_query, "$options": "i"}},
                    {"battery_type": {"$regex": search_query, "$options": "i"}},
                ]
            }
            
            cursor = self.collection.find(query).limit(limit).sort("created_at", -1)
            products = await cursor.to_list(length=limit)
            products_serialized = [self._serialize_product(p) for p in products]
            
            logger.info(f"Пошук '{search_query}': знайдено {len(products)} товарів")
            return products_serialized
            
        except Exception as e:
            logger.error(f"Помилка при пошуку товарів: {str(e)}")
            raise DatabaseError(f"Не вдалося виконати пошук: {str(e)}")


def get_product_service() -> ProductService:
    """Отримує екземпляр ProductService."""
    db = MongoDB.get_database()
    return ProductService(db)


