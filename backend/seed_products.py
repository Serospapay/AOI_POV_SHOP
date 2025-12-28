"""
Скрипт для заповнення бази даних реальними товарами пристроїв резервного живлення
"""
import asyncio
import sys
import random
from datetime import datetime
from pathlib import Path

# Додаємо корінь проекту до шляху
sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import MongoDB
from app.core.config import settings
from app.core.logging import setup_logging
from loguru import logger

# Налаштування логування
setup_logging()

# Реальні товари від відомих брендів
PRODUCTS = [
    # Power Banks - Xiaomi
    {
        "name": "Xiaomi Mi Power Bank 3 20000mAh",
        "description": "Потужний power bank від Xiaomi з ємністю 20000 mAh. Підтримує швидку зарядку USB-C Power Delivery до 18W. Компактний дизайн з алюмінієвим корпусом.",
        "price": 1299.00,
        "stock": 15,
        "is_active": True,
        "capacity": 20000,
        "power": 18,
        "battery_type": "Li-Polymer",
        "weight": 0.436,
        "dimensions": "154 x 73 x 23 mm",
        "image_url": "/images/xiaomi-mi-power-bank-3-20000.jpg"
    },
    {
        "name": "Xiaomi Redmi Power Bank 10000mAh",
        "description": "Компактний power bank від Xiaomi з ємністю 10000 mAh. Ідеальний для щоденного використання. Легкий та портативний.",
        "price": 699.00,
        "stock": 25,
        "is_active": True,
        "capacity": 10000,
        "power": 10,
        "battery_type": "Li-Polymer",
        "weight": 0.223,
        "dimensions": "147 x 71 x 14 mm",
        "image_url": "/images/xiaomi-redmi-power-bank-10000.jpg"
    },
    
    # Power Banks - Anker
    {
        "name": "Anker PowerCore 26800mAh",
        "description": "Потужний power bank від Anker з ємністю 26800 mAh. Може зарядити iPhone до 9 разів. Підтримує PowerIQ технологію для оптимальної швидкості зарядки.",
        "price": 2499.00,
        "stock": 8,
        "is_active": True,
        "capacity": 26800,
        "power": 15,
        "battery_type": "Li-Polymer",
        "weight": 0.570,
        "dimensions": "167 x 78 x 22 mm",
        "image_url": "/images/anker-powercore-26800.jpg"
    },
    {
        "name": "Anker PowerCore 10000 PD Redux",
        "description": "Компактний power bank з USB-C Power Delivery від Anker. Швидка зарядка до 18W. Ultra-compact дизайн для максимальної портативності.",
        "price": 1199.00,
        "stock": 18,
        "is_active": True,
        "capacity": 10000,
        "power": 18,
        "battery_type": "Li-Polymer",
        "weight": 0.198,
        "dimensions": "97 x 60 x 22 mm",
        "image_url": "/images/anker-powercore-10000-pd.jpg"
    },
    {
        "name": "Anker PowerCore Wireless 10000",
        "description": "Power bank з бездротовою зарядкою Qi від Anker. Заряджайте телефон без кабеля. Підтримує швидку бездротову зарядку до 10W.",
        "price": 1599.00,
        "stock": 12,
        "is_active": True,
        "capacity": 10000,
        "power": 15,
        "battery_type": "Li-Polymer",
        "weight": 0.250,
        "dimensions": "150 x 70 x 15 mm",
        "image_url": "/images/anker-powercore-wireless-10000.jpg"
    },
    
    # Power Banks - Baseus
    {
        "name": "Baseus 20000mAh Power Bank",
        "description": "Потужний power bank від Baseus з ємністю 20000 mAh. Підтримує швидку зарядку USB-C PD до 20W. Стильний дизайн з LED індикатором.",
        "price": 1099.00,
        "stock": 20,
        "is_active": True,
        "capacity": 20000,
        "power": 20,
        "battery_type": "Li-Polymer",
        "weight": 0.420,
        "dimensions": "160 x 75 x 20 mm",
        "image_url": "/images/baseus-20000-power-bank.jpg"
    },
    {
        "name": "Baseus Blade 10000mAh",
        "description": "Ультратонкий power bank від Baseus з ємністю 10000 mAh. Товщина всього 10мм. Ідеальний для кишені. Підтримує швидку зарядку.",
        "price": 899.00,
        "stock": 22,
        "is_active": True,
        "capacity": 10000,
        "power": 18,
        "battery_type": "Li-Polymer",
        "weight": 0.180,
        "dimensions": "130 x 65 x 10 mm",
        "image_url": "/images/baseus-blade-10000.jpg"
    },
    
    # Power Banks - Samsung
    {
        "name": "Samsung EB-P3300 10000mAh",
        "description": "Офіційний power bank від Samsung з ємністю 10000 mAh. Оптимізований для зарядки Samsung Galaxy пристроїв. Підтримує Adaptive Fast Charging.",
        "price": 1399.00,
        "stock": 10,
        "is_active": True,
        "capacity": 10000,
        "power": 15,
        "battery_type": "Li-Polymer",
        "weight": 0.220,
        "dimensions": "145 x 70 x 15 mm",
        "image_url": "/images/samsung-eb-p3300.jpg"
    },
    
    # Power Banks - Belkin
    {
        "name": "Belkin Boost Charge 10000mAh",
        "description": "Power bank від Belkin з ємністю 10000 mAh. Підтримує швидку зарядку для iPhone та інших пристроїв. Компактний та надійний.",
        "price": 1699.00,
        "stock": 7,
        "is_active": True,
        "capacity": 10000,
        "power": 18,
        "battery_type": "Li-Polymer",
        "weight": 0.210,
        "dimensions": "140 x 68 x 16 mm",
        "image_url": "/images/belkin-boost-charge-10000.jpg"
    },
    
    # UPS Systems - APC
    {
        "name": "APC Back-UPS BX600CI",
        "description": "Безперебійний блок живлення (UPS) від APC з потужністю 600VA/360W. Захистить ваш ПК, роутер та інші пристрої від збоїв електропостачання. Автоматичне регулювання напруги (AVR).",
        "price": 3499.00,
        "stock": 5,
        "is_active": True,
        "capacity": 600,
        "power": 360,
        "battery_type": "Lead-Acid",
        "weight": 5.2,
        "dimensions": "230 x 140 x 195 mm",
        "image_url": "/images/apc-back-ups-bx600ci.jpg"
    },
    {
        "name": "APC Back-UPS BX1000CI",
        "description": "Потужніший UPS від APC з потужністю 1000VA/600W. Ідеальний для домашнього офісу з кількома пристроями. Забезпечує до 5 хвилин роботи при повному навантаженні.",
        "price": 5499.00,
        "stock": 3,
        "is_active": True,
        "capacity": 1000,
        "power": 600,
        "battery_type": "Lead-Acid",
        "weight": 8.5,
        "dimensions": "280 x 150 x 220 mm",
        "image_url": "/images/apc-back-ups-bx1000ci.jpg"
    },
    
    # UPS Systems - CyberPower
    {
        "name": "CyberPower CP600EPFCLCD",
        "description": "UPS від CyberPower з потужністю 600VA/360W та LCD дисплеєм. Показує статус батареї, напругу та навантаження. Захист від перенапруги та перевантаження.",
        "price": 3299.00,
        "stock": 6,
        "is_active": True,
        "capacity": 600,
        "power": 360,
        "battery_type": "Lead-Acid",
        "weight": 5.8,
        "dimensions": "240 x 145 x 200 mm",
        "image_url": "/images/cyberpower-cp600epfclcd.jpg"
    },
    
    # Solar Power Banks
    {
        "name": "Anker PowerCore Solar 20000",
        "description": "Power bank з сонячною панеллю від Anker. Ємність 20000 mAh. Заряджається від сонця або від розетки. Ідеальний для кемпінгу та подорожей. Захищений від води (IPX4).",
        "price": 2999.00,
        "stock": 4,
        "is_active": True,
        "capacity": 20000,
        "power": 15,
        "battery_type": "Li-Polymer",
        "weight": 0.550,
        "dimensions": "180 x 90 x 25 mm",
        "image_url": "/images/anker-powercore-solar-20000.jpg"
    },
    {
        "name": "Xiaomi Mi Solar Power Bank 20000",
        "description": "Сонячний power bank від Xiaomi з ємністю 20000 mAh. Комбінована зарядка від сонця та розетки. Міцний корпус для активного використання.",
        "price": 2499.00,
        "stock": 5,
        "is_active": True,
        "capacity": 20000,
        "power": 18,
        "battery_type": "Li-Polymer",
        "weight": 0.520,
        "dimensions": "175 x 85 x 24 mm",
        "image_url": "/images/xiaomi-mi-solar-power-bank.jpg"
    },
    
    # Car Jump Starters
    {
        "name": "NOCO Boost Plus GB40",
        "description": "Автомобільний стартер-пак від NOCO з ємністю 1000A. Запускає двигуни до 6.0L бензинових та 3.0L дизельних. Також працює як power bank 10000 mAh для зарядки пристроїв.",
        "price": 4999.00,
        "stock": 3,
        "is_active": True,
        "capacity": 10000,
        "power": 1000,
        "battery_type": "Li-Polymer",
        "weight": 0.680,
        "dimensions": "180 x 85 x 35 mm",
        "image_url": "/images/noco-boost-plus-gb40.jpg"
    },
    {
        "name": "Baseus Car Jump Starter 12000mAh",
        "description": "Автомобільний стартер-пак від Baseus з ємністю 12000 mAh. Запускає двигуни до 5.0L. Вбудований LED ліхтар та power bank функція.",
        "price": 3499.00,
        "stock": 4,
        "is_active": True,
        "capacity": 12000,
        "power": 800,
        "battery_type": "Li-Polymer",
        "weight": 0.750,
        "dimensions": "190 x 90 x 40 mm",
        "image_url": "/images/baseus-car-jump-starter.jpg"
    },
    
    # Portable Power Stations
    {
        "name": "Anker PowerHouse 521",
        "description": "Портативна електростанція від Anker з ємністю 256Wh (51200 mAh). Може живити ноутбук, холодильник, телевізор. Вихідна потужність до 300W. Ідеальна для кемпінгу та екстрених ситуацій.",
        "price": 12999.00,
        "stock": 2,
        "is_active": True,
        "capacity": 51200,
        "power": 300,
        "battery_type": "Li-Polymer",
        "weight": 4.5,
        "dimensions": "280 x 180 x 180 mm",
        "image_url": "/images/anker-powerhouse-521.jpg"
    },
    {
        "name": "EcoFlow River 2",
        "description": "Компактна портативна електростанція від EcoFlow з ємністю 256Wh. Технологія X-Boost дозволяє живити пристрої до 600W. Швидка зарядка за 1 годину. Ідеальна для подорожей та домашнього використання.",
        "price": 14999.00,
        "stock": 2,
        "is_active": True,
        "capacity": 51200,
        "power": 300,
        "battery_type": "Li-Polymer",
        "weight": 3.5,
        "dimensions": "245 x 215 x 140 mm",
        "image_url": "/images/ecoflow-river-2.jpg"
    },
    
    # Wireless Charging Stands
    {
        "name": "Anker Wireless Charging Stand",
        "description": "Бездротова зарядна станція від Anker з функцією підставки. Підтримує швидку бездротову зарядку до 15W для iPhone та 10W для Samsung. Можна використовувати телефон під час зарядки.",
        "price": 1299.00,
        "stock": 15,
        "is_active": True,
        "capacity": 0,
        "power": 15,
        "battery_type": "N/A",
        "weight": 0.250,
        "dimensions": "120 x 80 x 100 mm",
        "image_url": "/images/anker-wireless-charging-stand.jpg"
    },
    {
        "name": "Samsung Wireless Charger Stand",
        "description": "Офіційна бездротова зарядна станція від Samsung. Підтримує швидку зарядку до 15W для Galaxy пристроїв. Стильний дизайн з охолодженням.",
        "price": 1499.00,
        "stock": 10,
        "is_active": True,
        "capacity": 0,
        "power": 15,
        "battery_type": "N/A",
        "weight": 0.280,
        "dimensions": "125 x 85 x 105 mm",
        "image_url": "/images/samsung-wireless-charger-stand.jpg"
    },
    
    # Power Banks для ноутбуків
    {
        "name": "Anker PowerCore+ 26800 PD",
        "description": "Потужний power bank від Anker з USB-C Power Delivery до 45W. Може зарядити MacBook Pro, Dell XPS та інші ноутбуки. Ємність 26800 mAh.",
        "price": 3999.00,
        "stock": 5,
        "is_active": True,
        "capacity": 26800,
        "power": 45,
        "battery_type": "Li-Polymer",
        "weight": 0.650,
        "dimensions": "170 x 80 x 25 mm",
        "image_url": "/images/anker-powercore-26800-pd.jpg"
    },
    {
        "name": "Baseus 30000mAh Laptop Power Bank",
        "description": "Power bank для ноутбуків від Baseus з ємністю 30000 mAh. Підтримує USB-C PD до 65W. Може зарядити більшість ноутбуків один раз повністю.",
        "price": 3499.00,
        "stock": 4,
        "is_active": True,
        "capacity": 30000,
        "power": 65,
        "battery_type": "Li-Polymer",
        "weight": 0.720,
        "dimensions": "180 x 90 x 28 mm",
        "image_url": "/images/baseus-30000-laptop.jpg"
    },
]


async def seed_products():
    """Заповнює базу даних реальними товарами"""
    try:
        # Підключення до БД
        await MongoDB.connect()
        db = MongoDB.get_database()
        products_collection = db.products

        # Перевірка чи є вже товари
        existing_count = await products_collection.count_documents({})
        if existing_count > 0:
            logger.warning(f"Знайдено {existing_count} існуючих товарів")
            await products_collection.delete_many({})
            logger.info("Існуючі товари видалено")

        # Додавання товарів
        now = datetime.utcnow()
        products_to_insert = []
        
        for product in PRODUCTS:
            # Генеруємо випадковий рейтинг від 3.8 до 5.0 та кількість оцінок від 10 до 200
            rating = round(random.uniform(3.8, 5.0), 1)
            rating_count = random.randint(10, 200)
            
            product_doc = {
                **product,
                "rating": rating,
                "rating_count": rating_count,
                "created_at": now,
                "updated_at": now,
            }
            products_to_insert.append(product_doc)

        # Вставка всіх товарів
        result = await products_collection.insert_many(products_to_insert)
        logger.success(f"[OK] Успішно додано {len(result.inserted_ids)} товарів до бази даних")

        # Виведення списку доданих товарів
        logger.info("\nДодані товари:")
        for i, product in enumerate(PRODUCTS, 1):
            logger.info(f"  {i}. {product['name']} - {product['price']} грн (Ємність: {product['capacity']} mAh, Потужність: {product['power']}W)")

    except Exception as e:
        logger.error(f"Помилка при заповненні БД: {str(e)}")
        raise
    finally:
        await MongoDB.disconnect()


if __name__ == "__main__":
    logger.info("Початок заповнення бази даних реальними товарами...")
    asyncio.run(seed_products())
    logger.info("Готово!")
