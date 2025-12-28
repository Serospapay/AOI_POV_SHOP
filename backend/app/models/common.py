"""
Спільні Pydantic моделі для пагінації та фільтрів.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Any


class PaginationParams(BaseModel):
    """Параметри пагінації."""
    
    page: int = Field(default=1, ge=1, description="Номер сторінки")
    limit: int = Field(default=20, ge=1, le=100, description="Кількість елементів на сторінці")
    
    @property
    def skip(self) -> int:
        """Обчислює skip для MongoDB."""
        return (self.page - 1) * self.limit


class PaginatedResponse(BaseModel):
    """Відповідь з пагінацією."""
    
    page: int
    limit: int
    total: int
    pages: int
    items: List[Any] = Field(default_factory=list, description="Список елементів")
    
    @classmethod
    def create(cls, page: int, limit: int, total: int, items: list = None):
        """Створює PaginatedResponse з обчисленням кількості сторінок."""
        pages = (total + limit - 1) // limit if total > 0 else 0
        return cls(
            page=page,
            limit=limit,
            total=total,
            pages=pages,
            items=items or [],
        )


class ProductFilters(BaseModel):
    """Фільтри для товарів."""
    
    capacity_min: Optional[int] = Field(None, ge=0, description="Мінімальна ємність (мАг)")
    capacity_max: Optional[int] = Field(None, ge=0, description="Максимальна ємність (мАг)")
    power_min: Optional[int] = Field(None, ge=0, description="Мінімальна потужність (Вт)")
    power_max: Optional[int] = Field(None, ge=0, description="Максимальна потужність (Вт)")
    battery_type: Optional[str] = Field(None, description="Тип батареї (Li-Ion, Li-Po, тощо)")
    price_min: Optional[float] = Field(None, ge=0, description="Мінімальна ціна")
    price_max: Optional[float] = Field(None, ge=0, description="Максимальна ціна")
    brand: Optional[str] = Field(None, description="Виробник (бренд)")
    category: Optional[str] = Field(None, description="Категорія товару")
    
    def to_mongo_query(self) -> dict:
        """Перетворює фільтри в MongoDB query."""
        query = {}
        
        if self.capacity_min is not None or self.capacity_max is not None:
            query["capacity"] = {}
            if self.capacity_min is not None:
                query["capacity"]["$gte"] = self.capacity_min
            if self.capacity_max is not None:
                query["capacity"]["$lte"] = self.capacity_max
        
        if self.power_min is not None or self.power_max is not None:
            query["power"] = {}
            if self.power_min is not None:
                query["power"]["$gte"] = self.power_min
            if self.power_max is not None:
                query["power"]["$lte"] = self.power_max
        
        if self.battery_type:
            query["battery_type"] = self.battery_type
        
        if self.price_min is not None or self.price_max is not None:
            query["price"] = {}
            if self.price_min is not None:
                query["price"]["$gte"] = self.price_min
            if self.price_max is not None:
                query["price"]["$lte"] = self.price_max
        
        # Фільтр по бренду (пошук в назві товару)
        if self.brand:
            query["name"] = {"$regex": f"^{self.brand}", "$options": "i"}
        
        # Фільтр по категорії (пошук в назві або описі)
        if self.category:
            if self.category == "Power Bank":
                query["$or"] = [
                    {"name": {"$regex": "power bank|powerbank", "$options": "i"}},
                    {"description": {"$regex": "power bank|powerbank", "$options": "i"}}
                ]
            elif self.category == "UPS":
                query["$or"] = [
                    {"name": {"$regex": "ups|back-ups|безперебійн", "$options": "i"}},
                    {"description": {"$regex": "ups|безперебійн", "$options": "i"}}
                ]
            elif self.category == "Solar":
                query["$or"] = [
                    {"name": {"$regex": "solar|сонячн", "$options": "i"}},
                    {"description": {"$regex": "solar|сонячн", "$options": "i"}}
                ]
            elif self.category == "Car Starter":
                query["$or"] = [
                    {"name": {"$regex": "jump|car|авто|стартер", "$options": "i"}},
                    {"description": {"$regex": "jump|авто|стартер", "$options": "i"}}
                ]
            elif self.category == "Power Station":
                query["$or"] = [
                    {"name": {"$regex": "powerhouse|river|station|електростанц", "$options": "i"}},
                    {"description": {"$regex": "powerhouse|електростанц", "$options": "i"}}
                ]
            elif self.category == "Wireless Stand":
                query["$or"] = [
                    {"name": {"$regex": "wireless.*stand|бездротов.*підставк", "$options": "i"}},
                    {"description": {"$regex": "wireless.*stand|бездротов.*підставк", "$options": "i"}}
                ]
            elif self.category == "Laptop Power Bank":
                query["$or"] = [
                    {"name": {"$regex": "laptop|ноутбук", "$options": "i"}},
                    {"description": {"$regex": "laptop|ноутбук", "$options": "i"}},
                    {"power": {"$gte": 40}}
                ]
        
        return query

