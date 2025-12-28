"""
API endpoints для адмін панелі.
"""
from typing import Dict, List
from fastapi import APIRouter, Depends, Query
from loguru import logger

from app.api.dependencies import get_current_admin
from app.models.auth import TokenData
from app.services.order_service import get_order_service, OrderService
from app.services.product_service import get_product_service, ProductService
from app.core.database import MongoDB

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
async def get_admin_stats(
    current_admin: TokenData = Depends(get_current_admin),
    order_service: OrderService = Depends(get_order_service),
    product_service: ProductService = Depends(get_product_service),
):
    """
    Отримує статистику для адмін панелі.
    Тільки для адміністраторів.
    """
    db = MongoDB.get_database()
    
    # Статистика замовлень
    orders_collection = db.orders
    products_collection = db.products
    users_collection = db.users
    
    # Загальна кількість замовлень
    total_orders = await orders_collection.count_documents({})
    
    # Замовлення за статусами
    orders_by_status = {}
    statuses = ["new", "processing", "shipped", "delivered", "cancelled"]
    for status in statuses:
        count = await orders_collection.count_documents({"order_status": status})
        orders_by_status[status] = count
    
    # Замовлення за статусом оплати
    paid_orders = await orders_collection.count_documents({"payment_status": "paid"})
    pending_orders = await orders_collection.count_documents({"payment_status": "pending"})
    
    # Загальна сума всіх замовлень
    pipeline_total = [
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ]
    total_revenue_result = await orders_collection.aggregate(pipeline_total).to_list(length=1)
    total_revenue = total_revenue_result[0]["total"] if total_revenue_result else 0.0
    
    # Сума оплачених замовлень
    pipeline_paid = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ]
    paid_revenue_result = await orders_collection.aggregate(pipeline_paid).to_list(length=1)
    paid_revenue = paid_revenue_result[0]["total"] if paid_revenue_result else 0.0
    
    # Статистика товарів
    total_products = await products_collection.count_documents({})
    active_products = await products_collection.count_documents({"is_active": True})
    
    # Товари з низьким залишком
    low_stock_products = await products_collection.count_documents({
        "stock": {"$lt": 10},
        "is_active": True
    })
    
    # Статистика користувачів
    total_users = await users_collection.count_documents({})
    admin_users = await users_collection.count_documents({"is_admin": True})
    
    # Останні замовлення (5)
    recent_orders = await orders_collection.find({}).sort("created_at", -1).limit(5).to_list(length=5)
    
    # Серіалізуємо останні замовлення
    serialized_recent_orders = []
    for order in recent_orders:
        serialized_order = {
            "id": str(order["_id"]),
            "order_status": order.get("order_status", "new"),
            "payment_status": order.get("payment_status", "pending"),
            "total_amount": order.get("total_amount", 0.0),
            "created_at": order.get("created_at").isoformat() if order.get("created_at") else None,
            "email": order.get("email", ""),
        }
        serialized_recent_orders.append(serialized_order)
    
    stats = {
        "orders": {
            "total": total_orders,
            "by_status": orders_by_status,
            "paid": paid_orders,
            "pending": pending_orders,
        },
        "revenue": {
            "total": total_revenue,
            "paid": paid_revenue,
            "pending": total_revenue - paid_revenue,
        },
        "products": {
            "total": total_products,
            "active": active_products,
            "low_stock": low_stock_products,
        },
        "users": {
            "total": total_users,
            "admins": admin_users,
        },
        "recent_orders": serialized_recent_orders,
    }
    
    logger.info(f"Адмін {current_admin.email} отримав статистику")
    return stats


@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    order_status: str = Query(..., description="Новий статус замовлення"),
    current_admin: TokenData = Depends(get_current_admin),
    order_service: OrderService = Depends(get_order_service),
):
    """
    Оновлює статус замовлення.
    Тільки для адміністраторів.
    """
    valid_statuses = ["new", "processing", "shipped", "delivered", "cancelled"]
    if order_status not in valid_statuses:
        from app.core.exceptions import ValidationError
        raise ValidationError(f"Невірний статус. Дозволені: {', '.join(valid_statuses)}")
    
    logger.info(f"Адмін {current_admin.email} змінює статус замовлення {order_id} на {order_status}")
    
    order = await order_service.update_order_status(
        order_id=order_id,
        order_status=order_status,
    )
    
    return order


@router.put("/orders/{order_id}/payment-status")
async def update_payment_status(
    order_id: str,
    payment_status: str = Query(..., description="Новий статус оплати"),
    current_admin: TokenData = Depends(get_current_admin),
    order_service: OrderService = Depends(get_order_service),
):
    """
    Оновлює статус оплати замовлення.
    Тільки для адміністраторів.
    """
    valid_statuses = ["pending", "paid", "failed", "refunded"]
    if payment_status not in valid_statuses:
        from app.core.exceptions import ValidationError
        raise ValidationError(f"Невірний статус оплати. Дозволені: {', '.join(valid_statuses)}")
    
    logger.info(f"Адмін {current_admin.email} змінює статус оплати замовлення {order_id} на {payment_status}")
    
    order = await order_service.update_order_status(
        order_id=order_id,
        payment_status=payment_status,
    )
    
    return order

