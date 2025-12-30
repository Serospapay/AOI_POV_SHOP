"""
Скрипт для додавання реальних відгуків з оцінками до товарів.
"""
import asyncio
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Додаємо корінь проекту до шляху
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import MongoDB
from app.services.review_service import ReviewService
from app.services.product_service import ProductService
from bson import ObjectId
from loguru import logger

# Реалістичні відгуки для різних товарів
REVIEWS_DATA = [
    {
        "rating": 5.0,
        "comment": "Чудовий power bank! Купив для подорожей, дуже зручний. Швидко заряджає телефон, тримає заряд довго. Рекомендую!",
        "user_name": "Олександр К.",
    },
    {
        "rating": 4.5,
        "comment": "Добре працює, але трохи важкий. Якість на висоті, швидка зарядка працює як треба. За ціну - відмінний варіант.",
        "user_name": "Марія В.",
    },
    {
        "rating": 5.0,
        "comment": "Найкращий power bank який я коли-небудь мав! Велика ємність, швидка зарядка, надійний. Використовую вже пів року - все працює ідеально.",
        "user_name": "Дмитро С.",
    },
    {
        "rating": 4.0,
        "comment": "Добре працює, але дизайн міг би бути кращим. Функціональність на рівні, заряджає швидко. Загалом задоволений покупкою.",
        "user_name": "Анна П.",
    },
    {
        "rating": 5.0,
        "comment": "Відмінна якість! Купив для роботи, заряджає ноутбук і телефон одночасно. Дуже зручно, рекомендую всім хто часто в дорозі.",
        "user_name": "Володимир М.",
    },
    {
        "rating": 4.5,
        "comment": "Добре працює, швидка зарядка працює як заявлено. Ємність відповідає заявленій. Трохи дорогуватий, але якість того варта.",
        "user_name": "Оксана Л.",
    },
    {
        "rating": 3.5,
        "comment": "Нормальний power bank, але очікував трохи більше. Заряджає добре, але час зарядки самого power bank трохи довгий. Загалом непогано.",
        "user_name": "Ігор Т.",
    },
    {
        "rating": 5.0,
        "comment": "Чудовий вибір! Велика ємність, швидка зарядка, компактний розмір. Використовую щодня, все працює бездоганно. Рекомендую!",
        "user_name": "Наталія К.",
    },
    {
        "rating": 4.0,
        "comment": "Добре працює, але трохи важкий для кишені. Якість хороша, заряджає швидко. За ціну - нормальний варіант.",
        "user_name": "Сергій Р.",
    },
    {
        "rating": 5.0,
        "comment": "Найкращий power bank за свої гроші! Купив для подорожей, дуже зручний і надійний. Швидка зарядка працює відмінно. Рекомендую всім!",
        "user_name": "Тетяна Б.",
    },
    {
        "rating": 4.5,
        "comment": "Добре працює, швидка зарядка працює як треба. Ємність відповідає заявленій. Трохи дорогуватий, але якість хороша.",
        "user_name": "Андрій Г.",
    },
    {
        "rating": 5.0,
        "comment": "Відмінна якість! Купив для роботи, заряджає всі пристрої швидко. Дуже зручно, рекомендую всім хто часто в дорозі.",
        "user_name": "Юлія Д.",
    },
    {
        "rating": 4.0,
        "comment": "Добре працює, але дизайн міг би бути кращим. Функціональність на рівні, заряджає швидко. Загалом задоволений покупкою.",
        "user_name": "Роман Ж.",
    },
    {
        "rating": 5.0,
        "comment": "Чудовий power bank! Велика ємність, швидка зарядка, надійний. Використовую вже кілька місяців - все працює ідеально.",
        "user_name": "Ірина С.",
    },
    {
        "rating": 4.5,
        "comment": "Добре працює, швидка зарядка працює як заявлено. Ємність відповідає заявленій. Трохи дорогуватий, але якість того варта.",
        "user_name": "Максим В.",
    },
]


async def add_reviews():
    """Додає відгуки до товарів."""
    try:
        # Підключаємося до БД
        await MongoDB.connect()
        logger.info("Підключено до MongoDB")
        
        db = MongoDB.get_database()
        review_service = ReviewService(db)
        product_service = ProductService(db)
        
        # Отримуємо всі товари
        products = await db.products.find({}).to_list(length=None)
        
        if not products:
            logger.warning("Товари не знайдено в базі даних")
            return
        
        logger.info(f"Знайдено {len(products)} товарів")
        
        # Перемішуємо відгуки для різноманітності
        import random
        reviews_to_use = REVIEWS_DATA.copy()
        random.shuffle(reviews_to_use)
        
        total_reviews_added = 0
        
        # Додаємо відгуки до кожного товару
        for product in products:
            product_id = str(product["_id"])
            product_name = product.get("name", "Товар")
            
            # Визначаємо скільки відгуків додати для цього товару (1-4 відгуки)
            num_reviews = random.randint(1, 4)
            
            logger.info(f"Додаємо {num_reviews} відгуків для товару: {product_name}")
            
            for i in range(num_reviews):
                if not reviews_to_use:
                    reviews_to_use = REVIEWS_DATA.copy()
                    random.shuffle(reviews_to_use)
                
                review_data = reviews_to_use.pop()
                
                # Створюємо відгук
                from app.models.review import ReviewCreate
                review_create = ReviewCreate(
                    product_id=product_id,
                    rating=review_data["rating"],
                    comment=review_data["comment"],
                    user_name=review_data["user_name"]
                )
                
                # Створюємо відгук через сервіс
                created_review = await review_service.create_review(review_create, user_id=None)
                
                # Одразу затверджуємо відгук
                review_id = created_review["id"]
                await review_service.moderate_review(
                    review_id=review_id,
                    is_approved=True,
                    moderator_comment="Автоматично затверджено"
                )
                
                total_reviews_added += 1
                
                # Додаємо різні дати створення для реалістичності
                days_ago = random.randint(1, 90)
                created_date = datetime.utcnow() - timedelta(days=days_ago)
                updated_date = created_date + timedelta(hours=random.randint(1, 24))
                
                await db.reviews.update_one(
                    {"_id": ObjectId(review_id)},
                    {
                        "$set": {
                            "created_at": created_date,
                            "updated_at": updated_date
                        }
                    }
                )
                
                logger.info(f"  ✓ Додано відгук з рейтингом {review_data['rating']}")
        
        logger.success(f"Успішно додано {total_reviews_added} відгуків")
        
        # Оновлюємо рейтинги всіх товарів
        logger.info("Оновлюємо рейтинги товарів...")
        for product in products:
            product_id = str(product["_id"])
            await review_service._update_product_rating(product_id)
        
        logger.success("Рейтинги товарів оновлено")
        
    except Exception as e:
        logger.error(f"Помилка при додаванні відгуків: {str(e)}")
        raise
    finally:
        await MongoDB.disconnect()
        logger.info("Відключено від MongoDB")


if __name__ == "__main__":
    asyncio.run(add_reviews())
