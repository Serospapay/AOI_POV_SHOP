"""
API endpoints для калькулятора підбору товарів.
"""
from typing import List, Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from loguru import logger

from app.services.product_service import get_product_service, ProductService
from app.core.database import MongoDB
from bson import ObjectId

router = APIRouter(prefix="/calculator", tags=["calculator"])


class DeviceInput(BaseModel):
    """Модель пристрою для розрахунку."""
    name: str = Field(..., description="Назва пристрою")
    battery_capacity: int = Field(..., ge=0, description="Ємність батареї пристрою (mAh)")
    charge_count: int = Field(..., ge=1, description="Скільки разів потрібно зарядити")
    power_consumption: Optional[int] = Field(None, ge=0, description="Споживання потужності (Вт) для ноутбуків")


class CalculatorRequest(BaseModel):
    """Запит на розрахунок необхідної ємності."""
    devices: List[DeviceInput] = Field(..., min_length=1, description="Список пристроїв")
    usage_days: int = Field(7, ge=1, le=30, description="На скільки днів потрібен заряд")
    efficiency: float = Field(0.8, ge=0.5, le=1.0, description="Коефіцієнт ефективності зарядки (0.8 = 80%)")


class CalculatorResponse(BaseModel):
    """Відповідь з розрахунками та підібраними товарами."""
    required_capacity: int = Field(..., description="Необхідна ємність (mAh)")
    recommended_products: List[dict] = Field(..., description="Рекомендовані товари")
    calculation_details: dict = Field(..., description="Деталі розрахунку")


@router.post("/power-bank", response_model=CalculatorResponse)
async def calculate_power_bank(request: CalculatorRequest):
    """
    Розраховує необхідну ємність power bank та підбирає відповідні товари.
    """
    try:
        product_service = get_product_service()
        db = MongoDB.get_database()
        
        # Розраховуємо необхідну ємність
        total_capacity_needed = 0
        device_details = []
        
        for device in request.devices:
            # Для кожного пристрою: ємність * кількість зарядок
            device_capacity = device.battery_capacity * device.charge_count
            total_capacity_needed += device_capacity
            device_details.append({
                "name": device.name,
                "battery_capacity": device.battery_capacity,
                "charge_count": device.charge_count,
                "total_capacity": device_capacity
            })
        
        # Враховуємо коефіцієнт ефективності (втрати при зарядці)
        # Додаємо запас 20% для надійності
        required_capacity = int((total_capacity_needed / request.efficiency) * 1.2)
        
        # Підбираємо товари з категорії Power Bank
        # Шукаємо товари з ємністю >= необхідної, але не більше ніж у 2 рази
        min_capacity = required_capacity
        max_capacity = required_capacity * 2
        
        # Отримуємо всі power banks
        products = await db.products.find({
            "category": {"$in": ["Power Bank", "Solar Power Bank", "Laptop Power Bank"]},
            "capacity": {"$gte": min_capacity, "$lte": max_capacity},
            "is_active": True
        }).sort("capacity", 1).limit(10).to_list(length=10)
        
        # Якщо не знайшли в діапазоні, беремо найближчі більші
        if not products:
            products = await db.products.find({
                "category": {"$in": ["Power Bank", "Solar Power Bank", "Laptop Power Bank"]},
                "capacity": {"$gte": min_capacity},
                "is_active": True
            }).sort("capacity", 1).limit(10).to_list(length=10)
        
        # Серіалізуємо товари
        recommended_products = [product_service._serialize_product(p) for p in products]
        
        # Розраховуємо час зарядки та кількість зарядок для кожного товару
        for product in recommended_products:
            if product.get("capacity") and product.get("power"):
                # Приблизний час зарядки самого power bank (залежить від потужності зарядки)
                # Припускаємо стандартну зарядку 10W
                charge_time_hours = (product["capacity"] / 1000) / 10  # приблизно
                product["estimated_charge_time"] = round(charge_time_hours, 1)
                
                # Скільки разів можна зарядити пристрої
                if total_capacity_needed > 0:
                    charge_cycles = int((product["capacity"] * request.efficiency) / total_capacity_needed)
                    product["charge_cycles"] = max(1, charge_cycles)
        
        calculation_details = {
            "total_devices": len(request.devices),
            "device_details": device_details,
            "total_capacity_needed": total_capacity_needed,
            "efficiency_factor": request.efficiency,
            "safety_margin": 0.2,
            "usage_days": request.usage_days,
            "daily_capacity_needed": round(total_capacity_needed / request.usage_days, 0)
        }
        
        logger.info(f"Розраховано необхідну ємність: {required_capacity} mAh для {len(request.devices)} пристроїв")
        
        return CalculatorResponse(
            required_capacity=required_capacity,
            recommended_products=recommended_products,
            calculation_details=calculation_details
        )
        
    except Exception as e:
        logger.error(f"Помилка при розрахунку power bank: {str(e)}")
        raise


@router.post("/ups")
async def calculate_ups(
    total_power: float = Query(..., ge=1, description="Загальна потужність пристроїв (Вт)"),
    runtime_minutes: int = Query(10, ge=1, description="Необхідний час роботи (хвилин)")
):
    """
    Розраховує необхідну потужність UPS та підбирає відповідні товари.
    """
    try:
        product_service = get_product_service()
        db = MongoDB.get_database()
        
        # Розраховуємо необхідну потужність UPS
        # Додаємо запас 30% для надійності
        required_power = int(total_power * 1.3)
        
        # Конвертуємо в VA (приблизно 0.6 коефіцієнт)
        required_va = int(required_power / 0.6)
        
        # Підбираємо UPS з потужністю >= необхідної
        products = await db.products.find({
            "category": "UPS",
            "power": {"$gte": required_power},
            "is_active": True
        }).sort("power", 1).limit(5).to_list(length=5)
        
        recommended_products = [product_service._serialize_product(p) for p in products]
        
        # Розраховуємо час роботи для кожного UPS
        for product in recommended_products:
            if product.get("power"):
                # Приблизний розрахунок часу роботи
                # Залежить від навантаження та ємності батареї
                estimated_runtime = (product["power"] / total_power) * runtime_minutes
                product["estimated_runtime_minutes"] = round(estimated_runtime, 0)
        
        return {
            "required_power": required_power,
            "required_va": required_va,
            "recommended_products": recommended_products,
            "calculation_details": {
                "total_power": total_power,
                "runtime_minutes": runtime_minutes,
                "safety_margin": 0.3
            }
        }
        
    except Exception as e:
        logger.error(f"Помилка при розрахунку UPS: {str(e)}")
        raise
