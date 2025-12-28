"""
API endpoints для замовлень.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from loguru import logger

from app.models.order import OrderCreate, OrderResponse
from app.services.order_service import get_order_service, OrderService
from app.services.payment_service import PaymentService
from app.api.dependencies import get_current_user, get_current_admin, get_current_user_optional
from app.models.auth import TokenData
from bson import ObjectId

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(
    order_data: OrderCreate,
    current_user: Optional[TokenData] = Depends(get_current_user_optional),
    order_service: OrderService = Depends(get_order_service),
    payment_service: PaymentService = Depends(lambda: PaymentService()),
):
    """
    Створює нове замовлення.
    Доступно як авторизованим, так і неавторизованим користувачам.
    """
    if current_user:
        logger.info(f"Користувач {current_user.email} створює замовлення")
        # Встановлюємо user_id з токена, якщо користувач авторизований
        order_data.user_id = current_user.user_id
    else:
        logger.info(f"Неавторизований користувач створює замовлення на email {order_data.email}")
        # Для неавторизованих користувачів user_id залишається None
        order_data.user_id = None
    
    # Створюємо замовлення
    order = await order_service.create_order(order_data)
    
    # Симулюємо оплату
    payment_result = await payment_service.process_payment(
        order_id=order["id"],
        amount=order["total_amount"],
    )
    
    # Оновлюємо статус оплати
    if payment_result["status"] == "success":
        order = await order_service.update_order_status(
            order_id=order["id"],
            payment_status="paid",
        )
        logger.info(f"Оплата замовлення {order['id']} успішна")
    
    # Order вже серіалізований в order_service
    return order


@router.get("/my", response_model=List[OrderResponse])
async def get_my_orders(
    limit: int = Query(50, ge=1, le=100, description="Максимальна кількість замовлень"),
    current_user: TokenData = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service),
):
    """
    Отримує замовлення поточного користувача.
    Доступно авторизованим користувачам.
    """
    orders = await order_service.get_orders_by_user(
        user_id=current_user.user_id,
        limit=limit,
    )
    
    # Orders вже серіалізовані в order_service
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: TokenData = Depends(get_current_user),
    order_service: OrderService = Depends(get_order_service),
):
    """
    Отримує детальну інформацію про замовлення.
    Доступно тільки власнику замовлення або адміністратору.
    """
    order = await order_service.get_order_by_id(order_id)
    
    if not order:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Замовлення", order_id)
    
    # Перевіряємо права доступу
    if order["user_id"] != current_user.user_id and not current_user.is_admin:
        from app.core.exceptions import ForbiddenError
        raise ForbiddenError("Ви не маєте доступу до цього замовлення")
    
    # Order вже серіалізований в order_service
    return order


@router.get("/admin/all", response_model=List[OrderResponse])
async def get_all_orders(
    limit: int = Query(100, ge=1, le=500, description="Максимальна кількість замовлень"),
    current_admin: TokenData = Depends(get_current_admin),
    order_service: OrderService = Depends(get_order_service),
):
    """
    Отримує всі замовлення.
    Тільки для адміністраторів.
    """
    orders = await order_service.get_all_orders(limit=limit)
    
    # Orders вже серіалізовані в order_service
    return orders


