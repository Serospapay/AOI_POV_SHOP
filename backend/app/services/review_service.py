"""
Сервіс для роботи з відгуками (CRUD операції та модерація).
"""
from typing import List, Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from bson.errors import InvalidId
from loguru import logger

from app.models.review import ReviewCreate, ReviewUpdate, Review
from app.core.exceptions import NotFoundError, DatabaseError, ValidationError


class ReviewService:
    """Сервіс для управління відгуками."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.reviews
    
    @staticmethod
    def _serialize_review(review: dict) -> dict:
        """
        Конвертує Mongo документ у серіалізований dict з id та iso-датами.
        """
        if not review:
            return review

        serialized = {}
        
        for key, value in review.items():
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
                serialized[key] = ReviewService._serialize_review(value)
            # Всі інші типи залишаємо як є
            else:
                serialized[key] = value

        return serialized
    
    async def create_review(self, review_data: ReviewCreate, user_id: Optional[str] = None) -> dict:
        """
        Створює новий відгук.
        """
        try:
            if not ObjectId.is_valid(review_data.product_id):
                raise ValidationError(f"Невірний ID товару: {review_data.product_id}")
            
            # Перевіряємо чи існує товар
            product = await self.db.products.find_one({"_id": ObjectId(review_data.product_id)})
            if not product:
                raise NotFoundError("Товар", review_data.product_id)
            
            # Перевіряємо чи користувач вже залишив відгук для цього товару
            if user_id:
                existing_review = await self.collection.find_one({
                    "product_id": review_data.product_id,
                    "user_id": user_id
                })
                if existing_review:
                    raise ValidationError("Ви вже залишили відгук для цього товару")
            
            # Створюємо відгук
            review_dict = review_data.model_dump()
            review_dict["user_id"] = user_id
            review_dict["is_approved"] = False
            review_dict["is_moderated"] = False
            review_dict["created_at"] = datetime.utcnow()
            review_dict["updated_at"] = datetime.utcnow()
            
            result = await self.collection.insert_one(review_dict)
            created_review = await self.collection.find_one({"_id": result.inserted_id})
            
            # Оновлюємо рейтинг товару
            await self._update_product_rating(review_data.product_id)
            
            logger.info(f"Створено відгук {result.inserted_id} для товару {review_data.product_id}")
            return self._serialize_review(created_review)
            
        except (NotFoundError, ValidationError):
            raise
        except Exception as e:
            logger.error(f"Помилка при створенні відгуку: {str(e)}")
            raise DatabaseError(f"Не вдалося створити відгук: {str(e)}")
    
    async def get_reviews_by_product(
        self, 
        product_id: str, 
        approved_only: bool = True,
        limit: int = 50
    ) -> List[dict]:
        """
        Отримує відгуки для товару.
        """
        try:
            if not ObjectId.is_valid(product_id):
                raise ValidationError(f"Невірний ID товару: {product_id}")
            
            query = {"product_id": product_id}
            if approved_only:
                query["is_approved"] = True
            
            reviews = await self.collection.find(query).sort("created_at", -1).limit(limit).to_list(length=limit)
            return [self._serialize_review(r) for r in reviews]
            
        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"Помилка при отриманні відгуків: {str(e)}")
            raise DatabaseError(f"Не вдалося отримати відгуки: {str(e)}")
    
    async def get_review_by_id(self, review_id: str) -> Optional[dict]:
        """
        Отримує відгук за ID.
        """
        try:
            if not ObjectId.is_valid(review_id):
                return None
            
            review = await self.collection.find_one({"_id": ObjectId(review_id)})
            return self._serialize_review(review) if review else None
            
        except Exception as e:
            logger.warning(f"Помилка при пошуку відгуку за ID {review_id}: {str(e)}")
            return None
    
    async def update_review(self, review_id: str, review_data: ReviewUpdate) -> dict:
        """
        Оновлює відгук.
        """
        try:
            if not ObjectId.is_valid(review_id):
                raise ValidationError(f"Невірний ID відгуку: {review_id}")
            
            existing_review = await self.collection.find_one({"_id": ObjectId(review_id)})
            if not existing_review:
                raise NotFoundError("Відгук", review_id)
            
            update_data = review_data.model_dump(exclude_unset=True)
            update_data["updated_at"] = datetime.utcnow()
            
            await self.collection.update_one(
                {"_id": ObjectId(review_id)},
                {"$set": update_data}
            )
            
            # Якщо змінився рейтинг або статус схвалення, оновлюємо рейтинг товару
            if "rating" in update_data or "is_approved" in update_data:
                await self._update_product_rating(existing_review["product_id"])
            
            updated_review = await self.get_review_by_id(review_id)
            logger.info(f"Оновлено відгук: {review_id}")
            
            return updated_review
            
        except (NotFoundError, ValidationError):
            raise
        except Exception as e:
            logger.error(f"Помилка при оновленні відгуку {review_id}: {str(e)}")
            raise DatabaseError(f"Не вдалося оновити відгук: {str(e)}")
    
    async def delete_review(self, review_id: str) -> bool:
        """
        Видаляє відгук.
        """
        try:
            if not ObjectId.is_valid(review_id):
                raise ValidationError(f"Невірний ID відгуку: {review_id}")
            
            review = await self.collection.find_one({"_id": ObjectId(review_id)})
            if not review:
                raise NotFoundError("Відгук", review_id)
            
            product_id = review["product_id"]
            
            await self.collection.delete_one({"_id": ObjectId(review_id)})
            
            # Оновлюємо рейтинг товару після видалення відгуку
            await self._update_product_rating(product_id)
            
            logger.info(f"Видалено відгук: {review_id}")
            return True
            
        except (NotFoundError, ValidationError):
            raise
        except Exception as e:
            logger.error(f"Помилка при видаленні відгуку {review_id}: {str(e)}")
            raise DatabaseError(f"Не вдалося видалити відгук: {str(e)}")
    
    async def get_pending_reviews(self, limit: int = 50) -> List[dict]:
        """
        Отримує відгуки, які потребують модерації.
        """
        try:
            reviews = await self.collection.find({
                "is_moderated": False
            }).sort("created_at", -1).limit(limit).to_list(length=limit)
            
            return [self._serialize_review(r) for r in reviews]
            
        except Exception as e:
            logger.error(f"Помилка при отриманні відгуків на модерацію: {str(e)}")
            raise DatabaseError(f"Не вдалося отримати відгуки: {str(e)}")
    
    async def moderate_review(
        self, 
        review_id: str, 
        is_approved: bool, 
        moderator_comment: Optional[str] = None
    ) -> dict:
        """
        Модерує відгук (схвалює або відхиляє).
        """
        try:
            if not ObjectId.is_valid(review_id):
                raise ValidationError(f"Невірний ID відгуку: {review_id}")
            
            review = await self.collection.find_one({"_id": ObjectId(review_id)})
            if not review:
                raise NotFoundError("Відгук", review_id)
            
            update_data = {
                "is_moderated": True,
                "is_approved": is_approved,
                "moderator_comment": moderator_comment,
                "updated_at": datetime.utcnow()
            }
            
            await self.collection.update_one(
                {"_id": ObjectId(review_id)},
                {"$set": update_data}
            )
            
            # Оновлюємо рейтинг товару
            await self._update_product_rating(review["product_id"])
            
            updated_review = await self.get_review_by_id(review_id)
            logger.info(f"Відгук {review_id} {'схвалено' if is_approved else 'відхилено'} модератором")
            
            return updated_review
            
        except (NotFoundError, ValidationError):
            raise
        except Exception as e:
            logger.error(f"Помилка при модерації відгуку {review_id}: {str(e)}")
            raise DatabaseError(f"Не вдалося змодерувати відгук: {str(e)}")
    
    async def _update_product_rating(self, product_id: str):
        """
        Оновлює середній рейтинг товару на основі схвалених відгуків.
        """
        try:
            # Отримуємо всі схвалені відгуки для товару
            approved_reviews = await self.collection.find({
                "product_id": product_id,
                "is_approved": True
            }).to_list(length=None)
            
            if not approved_reviews:
                # Якщо немає схвалених відгуків, скидаємо рейтинг
                await self.db.products.update_one(
                    {"_id": ObjectId(product_id)},
                    {"$set": {"rating": 0.0, "rating_count": 0}}
                )
                return
            
            # Обчислюємо середній рейтинг
            total_rating = sum(r["rating"] for r in approved_reviews)
            rating_count = len(approved_reviews)
            average_rating = round(total_rating / rating_count, 2)
            
            # Оновлюємо товар
            await self.db.products.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": {
                    "rating": average_rating,
                    "rating_count": rating_count
                }}
            )
            
        except Exception as e:
            logger.error(f"Помилка при оновленні рейтингу товару {product_id}: {str(e)}")


def get_review_service() -> ReviewService:
    """Dependency для отримання ReviewService."""
    from app.core.database import MongoDB
    db = MongoDB.get_database()
    return ReviewService(db)

