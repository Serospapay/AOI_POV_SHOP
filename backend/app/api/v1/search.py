"""
API endpoints для пошуку товарів.
"""
from fastapi import APIRouter, Depends, Query
from loguru import logger
from typing import List

from app.services.product_service import get_product_service, ProductService
from app.models.product import ProductResponse

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/products", response_model=List[ProductResponse])
async def search_products(
    q: str = Query(..., min_length=1, description="Пошуковий запит"),
    limit: int = Query(20, ge=1, le=100, description="Максимальна кількість результатів"),
    product_service: ProductService = Depends(get_product_service),
):
    """
    Розумний пошук товарів за назвою, описом та типом батареї.
    Доступно всім користувачам.
    """
    logger.info(f"Пошук товарів: '{q}'")
    
    products = await product_service.search_products(search_query=q, limit=limit)
    
    # Конвертуємо ObjectId в строки
    products_response = []
    for product in products:
        product["id"] = str(product["_id"])
        del product["_id"]
        products_response.append(product)
    
    return products_response


