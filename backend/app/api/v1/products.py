"""
API endpoints для товарів.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import JSONResponse
from loguru import logger

from app.models.product import ProductCreate, ProductUpdate, ProductResponse
from app.models.common import PaginationParams, ProductFilters, PaginatedResponse
from app.models.rating import RatingCreate, RatingResponse
from app.services.product_service import get_product_service, ProductService
from app.api.dependencies import get_current_admin, get_current_user_optional
from app.models.auth import TokenData

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=PaginatedResponse)
async def get_products(
    page: int = Query(1, ge=1, description="Номер сторінки"),
    limit: int = Query(20, ge=1, le=100, description="Кількість на сторінці"),
    capacity_min: Optional[int] = Query(None, ge=0, description="Мінімальна ємність"),
    capacity_max: Optional[int] = Query(None, ge=0, description="Максимальна ємність"),
    power_min: Optional[int] = Query(None, ge=0, description="Мінімальна потужність"),
    power_max: Optional[int] = Query(None, ge=0, description="Максимальна потужність"),
    battery_type: Optional[str] = Query(None, description="Тип батареї"),
    price_min: Optional[float] = Query(None, ge=0, description="Мінімальна ціна"),
    price_max: Optional[float] = Query(None, ge=0, description="Максимальна ціна"),
    brand: Optional[str] = Query(None, description="Виробник (бренд)"),
    category: Optional[str] = Query(None, description="Категорія товару"),
    product_service: ProductService = Depends(get_product_service),
):
    """
    Отримує список товарів з пагінацією та фільтрами.
    Доступно всім користувачам (тільки активні товари).
    """
    pagination = PaginationParams(page=page, limit=limit)
    
    filters = ProductFilters(
        capacity_min=capacity_min,
        capacity_max=capacity_max,
        power_min=power_min,
        power_max=power_max,
        battery_type=battery_type,
        price_min=price_min,
        price_max=price_max,
        brand=brand,
        category=category,
    )
    
    products, total = await product_service.get_products(
        pagination=pagination,
        filters=filters,
        only_active=True,
    )
    
    return PaginatedResponse.create(
        page=pagination.page,
        limit=pagination.limit,
        total=total,
        items=products,
    )


@router.get("/{product_id}")
async def get_product(
    product_id: str,
    product_service: ProductService = Depends(get_product_service),
):
    """
    Отримує детальну інформацію про товар за ID.
    Доступно всім користувачам.
    """
    product = await product_service.get_product_by_id(product_id)
    
    if not product:
        from app.core.exceptions import NotFoundError
        raise NotFoundError("Товар", product_id)
    
    # Повертаємо через JSONResponse для гарантованої серіалізації
    return JSONResponse(content=product)


@router.post("", response_model=ProductResponse, status_code=201)
async def create_product(
    product_data: ProductCreate,
    current_admin: TokenData = Depends(get_current_admin),
    product_service: ProductService = Depends(get_product_service),
):
    """
    Створює новий товар.
    Тільки для адміністраторів.
    """
    logger.info(f"Адмін {current_admin.email} створює товар: {product_data.name}")
    
    product = await product_service.create_product(product_data)
    
    return product


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    current_admin: TokenData = Depends(get_current_admin),
    product_service: ProductService = Depends(get_product_service),
):
    """
    Оновлює товар.
    Тільки для адміністраторів.
    """
    logger.info(f"Адмін {current_admin.email} оновлює товар: {product_id}")
    
    product = await product_service.update_product(product_id, product_data)
    
    # Повертаємо через JSONResponse для гарантованої серіалізації
    return JSONResponse(content=product)


@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: str,
    current_admin: TokenData = Depends(get_current_admin),
    product_service: ProductService = Depends(get_product_service),
):
    """
    Видаляє товар (soft delete).
    Тільки для адміністраторів.
    """
    logger.info(f"Адмін {current_admin.email} видаляє товар: {product_id}")
    
    await product_service.delete_product(product_id)
    return None


@router.post("/{product_id}/rate")
async def rate_product(
    product_id: str,
    rating_data: RatingCreate,
    current_user: Optional[TokenData] = Depends(get_current_user_optional),
    product_service: ProductService = Depends(get_product_service),
):
    """
    Оцінює товар (від 1 до 5).
    Доступно всім користувачам (авторизованим та ні).
    """
    if rating_data.product_id != product_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="ID товару в URL та в тілі не співпадають")
    
    product = await product_service.rate_product(product_id, rating_data.rating)
    
    return JSONResponse(content={
        "product_id": product_id,
        "rating": product["rating"],
        "rating_count": product["rating_count"],
        "message": "Товар успішно оцінено"
    })

