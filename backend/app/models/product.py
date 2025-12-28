"""
Pydantic моделі для товарів (Product).
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId


class PyObjectId(str):
    """Кастомний клас для ObjectId з валідацією Pydantic v2."""
    
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        from pydantic_core import core_schema
        
        def validate_from_str(value) -> ObjectId:
            if isinstance(value, ObjectId):
                return value
            if isinstance(value, str) and ObjectId.is_valid(value):
                return ObjectId(value)
            raise ValueError("Invalid ObjectId")
        
        return core_schema.no_info_plain_validator_function(
            validate_from_str,
            serialization=core_schema.str_schema(),
        )


# Базові моделі
class ProductBase(BaseModel):
    """Базова модель товару."""
    
    name: str = Field(..., min_length=1, max_length=200, description="Назва товару")
    description: Optional[str] = Field(None, description="Опис товару")
    price: float = Field(..., gt=0, description="Ціна товару")
    image_url: Optional[str] = Field(None, description="URL зображення товару")
    capacity: Optional[int] = Field(None, ge=0, description="Ємність батареї (мАг)")
    power: Optional[int] = Field(None, ge=0, description="Потужність (Вт)")
    battery_type: Optional[str] = Field(None, description="Тип батареї (наприклад, Li-Ion, Li-Po)")
    brand: Optional[str] = Field(None, description="Бренд товару")
    category: Optional[str] = Field(None, description="Категорія товару")
    weight: Optional[float] = Field(None, ge=0, description="Вага (кг)")
    dimensions: Optional[str] = Field(None, description="Габарити")
    stock: int = Field(default=0, ge=0, description="Кількість на складі")
    is_active: bool = Field(default=True, description="Чи активний товар")
    rating: float = Field(default=0.0, ge=0.0, le=5.0, description="Середній рейтинг (0-5)")
    rating_count: int = Field(default=0, ge=0, description="Кількість оцінок")


class ProductCreate(ProductBase):
    """Модель для створення товару."""
    pass


class ProductUpdate(BaseModel):
    """Модель для оновлення товару (всі поля опціональні)."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None)
    price: Optional[float] = Field(None, gt=0)
    image_url: Optional[str] = None
    capacity: Optional[int] = Field(None, ge=0)
    power: Optional[int] = Field(None, ge=0)
    battery_type: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    weight: Optional[float] = Field(None, ge=0)
    dimensions: Optional[str] = None
    stock: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class Product(ProductBase):
    """Модель товару з ID та датами."""
    
    id: PyObjectId = Field(default_factory=lambda: ObjectId(), alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ProductResponse(Product):
    """Модель для відповіді API (з конвертацією ObjectId в строку)."""
    
    class Config:
        from_attributes = True

