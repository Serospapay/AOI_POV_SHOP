"""
Скрипт для оновлення всіх товарів з повними характеристиками та описом.
"""
import asyncio
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import MongoDB
from bson import ObjectId
from loguru import logger

# Повні дані для всіх товарів з усіма полями
PRODUCTS_FULL_DATA = {
    "Xiaomi Mi Power Bank 3 20000mAh": {
        "description": "Потужний power bank від Xiaomi з ємністю 20000 mAh. Підтримує швидку зарядку USB-C Power Delivery до 18W. Компактний дизайн з алюмінієвим корпусом. Два USB-A порти та один USB-C порт для максимальної сумісності. Захист від перегріву, перезарядки та короткого замикання.",
        "brand": "Xiaomi",
        "category": "Power Bank",
        "capacity": 20000,
        "power": 18,
        "battery_type": "Li-Polymer",
        "weight": 0.436,
        "dimensions": "154 x 73 x 23 mm"
    },
    "Xiaomi Redmi Power Bank 10000mAh": {
        "description": "Компактний power bank від Xiaomi з ємністю 10000 mAh. Ідеальний для щоденного використання. Легкий та портативний. Підтримує швидку зарядку до 10W. Один USB-A та один USB-C порт. Індикатор рівня заряду.",
        "brand": "Xiaomi",
        "category": "Power Bank",
        "capacity": 10000,
        "power": 10,
        "battery_type": "Li-Polymer",
        "weight": 0.223,
        "dimensions": "147 x 71 x 14 mm"
    },
    "Anker PowerCore 26800mAh": {
        "description": "Потужний power bank від Anker з ємністю 26800 mAh. Може зарядити iPhone до 9 разів. Підтримує PowerIQ технологію для оптимальної швидкості зарядки. Три USB-A порти для одночасної зарядки кількох пристроїв. Захист від перегріву та перезарядки.",
        "brand": "Anker",
        "category": "Power Bank",
        "capacity": 26800,
        "power": 15,
        "battery_type": "Li-Polymer",
        "weight": 0.570,
        "dimensions": "167 x 78 x 22 mm"
    },
    "Anker PowerCore 10000 PD Redux": {
        "description": "Компактний power bank з USB-C Power Delivery від Anker. Швидка зарядка до 18W. Ultra-compact дизайн для максимальної портативності. Один USB-C та один USB-A порт. Ідеальний для подорожей та щоденного використання.",
        "brand": "Anker",
        "category": "Power Bank",
        "capacity": 10000,
        "power": 18,
        "battery_type": "Li-Polymer",
        "weight": 0.198,
        "dimensions": "97 x 60 x 22 mm"
    },
    "Anker PowerCore Wireless 10000": {
        "description": "Power bank з бездротовою зарядкою Qi від Anker. Заряджайте телефон без кабеля. Підтримує швидку бездротову зарядку до 10W. Також має USB-A порт для проводної зарядки. Індикатор рівня заряду та статусу бездротової зарядки.",
        "brand": "Anker",
        "category": "Power Bank",
        "capacity": 10000,
        "power": 15,
        "battery_type": "Li-Polymer",
        "weight": 0.250,
        "dimensions": "150 x 70 x 15 mm"
    },
    "Baseus 20000mAh Power Bank": {
        "description": "Потужний power bank від Baseus з ємністю 20000 mAh. Підтримує швидку зарядку USB-C PD до 20W. Стильний дизайн з LED індикатором. Два USB-A та один USB-C порт. Захист від перегріву, перезарядки та короткого замикання.",
        "brand": "Baseus",
        "category": "Power Bank",
        "capacity": 20000,
        "power": 20,
        "battery_type": "Li-Polymer",
        "weight": 0.420,
        "dimensions": "160 x 75 x 20 mm"
    },
    "Baseus Blade 10000mAh": {
        "description": "Ультратонкий power bank від Baseus з ємністю 10000 mAh. Товщина всього 10мм. Ідеальний для кишені. Підтримує швидку зарядку до 18W. Компактний дизайн з металевим корпусом. Один USB-C та один USB-A порт.",
        "brand": "Baseus",
        "category": "Power Bank",
        "capacity": 10000,
        "power": 18,
        "battery_type": "Li-Polymer",
        "weight": 0.180,
        "dimensions": "130 x 65 x 10 mm"
    },
    "Samsung EB-P3300 10000mAh": {
        "description": "Офіційний power bank від Samsung з ємністю 10000 mAh. Оптимізований для зарядки Samsung Galaxy пристроїв. Підтримує Adaptive Fast Charging до 15W. Компактний та легкий дизайн. Один USB-A порт з підтримкою швидкої зарядки.",
        "brand": "Samsung",
        "category": "Power Bank",
        "capacity": 10000,
        "power": 15,
        "battery_type": "Li-Polymer",
        "weight": 0.220,
        "dimensions": "145 x 70 x 15 mm"
    },
    "Belkin Boost Charge 10000mAh": {
        "description": "Power bank від Belkin з ємністю 10000 mAh. Підтримує швидку зарядку для iPhone та інших пристроїв. Компактний та надійний. Один USB-A порт з підтримкою Apple Fast Charge. Захист від перегріву та перезарядки.",
        "brand": "Belkin",
        "category": "Power Bank",
        "capacity": 10000,
        "power": 18,
        "battery_type": "Li-Polymer",
        "weight": 0.210,
        "dimensions": "140 x 68 x 16 mm"
    },
    "APC Back-UPS BX600CI": {
        "description": "Безперебійний блок живлення (UPS) від APC з потужністю 600VA/360W. Захистить ваш ПК, роутер та інші пристрої від збоїв електропостачання. Автоматичне регулювання напруги (AVR). Забезпечує до 3 хвилин роботи при повному навантаженні. Шість розеток з захистом від перенапруги.",
        "brand": "APC",
        "category": "UPS",
        "capacity": 600,
        "power": 360,
        "battery_type": "Lead-Acid",
        "weight": 5.2,
        "dimensions": "230 x 140 x 195 mm"
    },
    "APC Back-UPS BX1000CI": {
        "description": "Потужніший UPS від APC з потужністю 1000VA/600W. Ідеальний для домашнього офісу з кількома пристроями. Забезпечує до 5 хвилин роботи при повному навантаженні. Автоматичне регулювання напруги (AVR). Восемь розеток з захистом від перенапруги. LCD дисплей з інформацією про статус.",
        "brand": "APC",
        "category": "UPS",
        "capacity": 1000,
        "power": 600,
        "battery_type": "Lead-Acid",
        "weight": 8.5,
        "dimensions": "280 x 150 x 220 mm"
    },
    "CyberPower CP600EPFCLCD": {
        "description": "UPS від CyberPower з потужністю 600VA/360W та LCD дисплеєм. Показує статус батареї, напругу та навантаження. Захист від перенапруги та перевантаження. Шість розеток з захистом. Автоматичне регулювання напруги. Забезпечує до 3 хвилин роботи при повному навантаженні.",
        "brand": "CyberPower",
        "category": "UPS",
        "capacity": 600,
        "power": 360,
        "battery_type": "Lead-Acid",
        "weight": 5.8,
        "dimensions": "240 x 145 x 200 mm"
    },
    "Anker PowerCore Solar 20000": {
        "description": "Power bank з сонячною панеллю від Anker. Ємність 20000 mAh. Заряджається від сонця або від розетки. Ідеальний для кемпінгу та подорожей. Захищений від води (IPX4). Міцний корпус для активного використання. Два USB-A порти для одночасної зарядки.",
        "brand": "Anker",
        "category": "Solar Power Bank",
        "capacity": 20000,
        "power": 15,
        "battery_type": "Li-Polymer",
        "weight": 0.550,
        "dimensions": "180 x 90 x 25 mm"
    },
    "Xiaomi Mi Solar Power Bank 20000": {
        "description": "Сонячний power bank від Xiaomi з ємністю 20000 mAh. Комбінована зарядка від сонця та розетки. Міцний корпус для активного використання. Підтримує швидку зарядку до 18W. Два USB-A та один USB-C порт. Захист від води та пилу.",
        "brand": "Xiaomi",
        "category": "Solar Power Bank",
        "capacity": 20000,
        "power": 18,
        "battery_type": "Li-Polymer",
        "weight": 0.520,
        "dimensions": "175 x 85 x 24 mm"
    },
    "NOCO Boost Plus GB40": {
        "description": "Автомобільний стартер-пак від NOCO з ємністю 1000A. Запускає двигуни до 6.0L бензинових та 3.0L дизельних. Також працює як power bank 10000 mAh для зарядки пристроїв. Вбудований LED ліхтар. Захист від зворотної полярності та перегріву.",
        "brand": "NOCO",
        "category": "Car Jump Starter",
        "capacity": 10000,
        "power": 1000,
        "battery_type": "Li-Polymer",
        "weight": 0.680,
        "dimensions": "180 x 85 x 35 mm"
    },
    "Baseus Car Jump Starter 12000mAh": {
        "description": "Автомобільний стартер-пак від Baseus з ємністю 12000 mAh. Запускає двигуни до 5.0L. Вбудований LED ліхтар та power bank функція. Захист від зворотної полярності, перегріву та перезарядки. Компактний та легкий дизайн.",
        "brand": "Baseus",
        "category": "Car Jump Starter",
        "capacity": 12000,
        "power": 800,
        "battery_type": "Li-Polymer",
        "weight": 0.750,
        "dimensions": "190 x 90 x 40 mm"
    },
    "Anker PowerHouse 521": {
        "description": "Портативна електростанція від Anker з ємністю 256Wh (51200 mAh). Може живити ноутбук, холодильник, телевізор. Вихідна потужність до 300W. Ідеальна для кемпінгу та екстрених ситуацій. Два AC розетки, два USB-A та один USB-C порт. LCD дисплей з інформацією про залишок заряду.",
        "brand": "Anker",
        "category": "Portable Power Station",
        "capacity": 51200,
        "power": 300,
        "battery_type": "Li-Polymer",
        "weight": 4.5,
        "dimensions": "280 x 180 x 180 mm"
    },
    "EcoFlow River 2": {
        "description": "Компактна портативна електростанція від EcoFlow з ємністю 256Wh. Технологія X-Boost дозволяє живити пристрої до 600W. Швидка зарядка за 1 годину. Ідеальна для подорожей та домашнього використання. Два AC розетки, три USB-A та два USB-C порти. Мобільний додаток для моніторингу.",
        "brand": "EcoFlow",
        "category": "Portable Power Station",
        "capacity": 51200,
        "power": 300,
        "battery_type": "Li-Polymer",
        "weight": 3.5,
        "dimensions": "245 x 215 x 140 mm"
    },
    "Anker Wireless Charging Stand": {
        "description": "Бездротова зарядна станція від Anker з функцією підставки. Підтримує швидку бездротову зарядку до 15W для iPhone та 10W для Samsung. Можна використовувати телефон під час зарядки. Підтримка вертикального та горизонтального режимів. LED індикатор статусу зарядки.",
        "brand": "Anker",
        "category": "Wireless Charger",
        "capacity": 0,
        "power": 15,
        "battery_type": "N/A",
        "weight": 0.250,
        "dimensions": "120 x 80 x 100 mm"
    },
    "Samsung Wireless Charger Stand": {
        "description": "Офіційна бездротова зарядна станція від Samsung. Підтримує швидку зарядку до 15W для Galaxy пристроїв. Стильний дизайн з охолодженням. Підтримка вертикального та горизонтального режимів. LED індикатор статусу зарядки. Оптимізована для Samsung Galaxy серії.",
        "brand": "Samsung",
        "category": "Wireless Charger",
        "capacity": 0,
        "power": 15,
        "battery_type": "N/A",
        "weight": 0.280,
        "dimensions": "125 x 85 x 105 mm"
    },
    "Anker PowerCore+ 26800 PD": {
        "description": "Потужний power bank від Anker з USB-C Power Delivery до 45W. Може зарядити MacBook Pro, Dell XPS та інші ноутбуки. Ємність 26800 mAh. Два USB-A та один USB-C порт. Захист від перегріву та перезарядки. Ідеальний для подорожей з ноутбуком.",
        "brand": "Anker",
        "category": "Laptop Power Bank",
        "capacity": 26800,
        "power": 45,
        "battery_type": "Li-Polymer",
        "weight": 0.650,
        "dimensions": "170 x 80 x 25 mm"
    },
    "Baseus 30000mAh Laptop Power Bank": {
        "description": "Power bank для ноутбуків від Baseus з ємністю 30000 mAh. Підтримує USB-C PD до 65W. Може зарядити більшість ноутбуків один раз повністю. Два USB-A та один USB-C порт. Захист від перегріву, перезарядки та короткого замикання. LCD дисплей з інформацією про залишок заряду.",
        "brand": "Baseus",
        "category": "Laptop Power Bank",
        "capacity": 30000,
        "power": 65,
        "battery_type": "Li-Polymer",
        "weight": 0.720,
        "dimensions": "180 x 90 x 28 mm"
    },
}


async def update_products():
    """Оновлює всі товари з повними характеристиками."""
    try:
        await MongoDB.connect()
        logger.info("Підключено до MongoDB")
        
        db = MongoDB.get_database()
        products_collection = db.products
        
        # Отримуємо всі товари
        products = await products_collection.find({}).to_list(length=None)
        logger.info(f"Знайдено {len(products)} товарів")
        
        updated_count = 0
        
        for product in products:
            product_name = product.get("name")
            
            if product_name in PRODUCTS_FULL_DATA:
                full_data = PRODUCTS_FULL_DATA[product_name]
                
                # Оновлюємо товар
                update_data = {
                    **full_data,
                    "updated_at": datetime.utcnow()
                }
                
                await products_collection.update_one(
                    {"_id": product["_id"]},
                    {"$set": update_data}
                )
                
                updated_count += 1
                logger.info(f"✓ Оновлено: {product_name}")
            else:
                logger.warning(f"⚠ Не знайдено даних для: {product_name}")
        
        logger.success(f"Успішно оновлено {updated_count} товарів")
        
    except Exception as e:
        logger.error(f"Помилка при оновленні товарів: {str(e)}")
        raise
    finally:
        await MongoDB.disconnect()
        logger.info("Відключено від MongoDB")


if __name__ == "__main__":
    asyncio.run(update_products())
