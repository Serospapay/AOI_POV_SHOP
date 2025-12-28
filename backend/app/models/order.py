"""
Pydantic моделі для замовлень (Order).
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId
from app.models.product import PyObjectId


class OrderItem(BaseModel):
    """Елемент замовлення."""
    
    product_id: str = Field(..., description="ID товару")
    product_name: str = Field(..., description="Назва товару")
    quantity: int = Field(..., ge=1, description="Кількість")
    price: float = Field(..., gt=0, description="Ціна за одиницю")
    
    @property
    def total(self) -> float:
        """Загальна вартість позиції."""
        return self.quantity * self.price


class OrderAddress(BaseModel):
    """Адреса доставки."""
    
    street: str = Field(..., min_length=1, description="Вулиця")
    city: str = Field(..., min_length=1, description="Місто")
    postal_code: str = Field(..., min_length=1, description="Поштовий індекс")
    country: str = Field(default="Україна", description="Країна")
    phone: str = Field(..., min_length=10, description="Телефон")


class OrderBase(BaseModel):
    """Базова модель замовлення."""
    
    user_id: Optional[str] = Field(None, description="ID користувача (опціонально для неавторизованих)")
    items: List[OrderItem] = Field(..., min_items=1, description="Товари в замовленні")
    address: OrderAddress = Field(..., description="Адреса доставки")
    email: EmailStr = Field(..., description="Email для зв'язку")
    notes: Optional[str] = Field(None, description="Примітки до замовлення")
    payment_method: str = Field(default="card", description="Спосіб оплати (card, cash, online)")
    delivery_method: str = Field(default="courier", description="Спосіб доставки (courier, post, pickup)")
    payment_status: str = Field(default="pending", description="Статус оплати")
    order_status: str = Field(default="new", description="Статус замовлення")


class OrderCreate(OrderBase):
    """Модель для створення замовлення."""
    pass


class Order(OrderBase):
    """Модель замовлення з ID та датами."""
    
    id: PyObjectId = Field(default_factory=lambda: ObjectId(), alias="_id")
    items_total: float = Field(..., gt=0, description="Сума товарів")
    delivery_cost: float = Field(default=0.0, ge=0, description="Вартість доставки")
    total_amount: float = Field(..., gt=0, description="Загальна сума замовлення")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


class OrderResponse(Order):
    """Модель для відповіді API."""
    
    class Config:
        from_attributes = True

