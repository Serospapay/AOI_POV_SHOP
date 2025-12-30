"""
API endpoints для відгуків.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import JSONResponse
from loguru import logger

from app.models.review import ReviewCreate, ReviewUpdate, ReviewResponse
from app.services.review_service import get_review_service, ReviewService
from app.api.dependencies import get_current_admin, get_current_user_optional
from app.models.auth import TokenData

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("/product/{product_id}")
async def get_product_reviews(
    product_id: str,
    approved_only: bool = Query(True, description="Тільки схвалені відгуки"),
    limit: int = Query(50, ge=1, le=100, description="Максимальна кількість відгуків"),
    review_service: ReviewService = Depends(get_review_service),
):
    """
    Отримує відгуки для товару.
    Доступно всім користувачам.
    """
    reviews = await review_service.get_reviews_by_product(
        product_id=product_id,
        approved_only=approved_only,
        limit=limit
    )
    
    return JSONResponse(content=reviews)


@router.post("/product/{product_id}")
async def create_review(
    product_id: str,
    review_data: ReviewCreate,
    current_user: Optional[TokenData] = Depends(get_current_user_optional),
    review_service: ReviewService = Depends(get_review_service),
):
    """
    Створює новий відгук для товару.
    Доступно всім користувачам (авторизованим та ні).
    """
    if review_data.product_id != product_id:
        raise HTTPException(status_code=400, detail="ID товару в URL та в тілі не співпадають")
    
    user_id = current_user.user_id if current_user else None
    
    review = await review_service.create_review(
        review_data=review_data,
        user_id=user_id
    )
    
    logger.info(f"Створено відгук {review['id']} для товару {product_id} користувачем {user_id or 'anonymous'}")
    
    return JSONResponse(content=review)


@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: str,
    review_data: ReviewUpdate,
    current_user: Optional[TokenData] = Depends(get_current_user_optional),
    review_service: ReviewService = Depends(get_review_service),
):
    """
    Оновлює відгук.
    Користувач може оновити тільки свій відгук.
    """
    review = await review_service.get_review_by_id(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Відгук не знайдено")
    
    # Перевіряємо права доступу
    if current_user:
        if review.get("user_id") != current_user.user_id:
            raise HTTPException(status_code=403, detail="Ви можете редагувати тільки свої відгуки")
    else:
        # Неавторизовані користувачі не можуть редагувати відгуки
        raise HTTPException(status_code=401, detail="Потрібна авторизація для редагування відгуків")
    
    updated_review = await review_service.update_review(review_id, review_data)
    
    return updated_review


@router.delete("/{review_id}", status_code=204)
async def delete_review(
    review_id: str,
    current_user: Optional[TokenData] = Depends(get_current_user_optional),
    review_service: ReviewService = Depends(get_review_service),
):
    """
    Видаляє відгук.
    Користувач може видалити тільки свій відгук.
    """
    review = await review_service.get_review_by_id(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Відгук не знайдено")
    
    # Перевіряємо права доступу
    if current_user:
        if review.get("user_id") != current_user.user_id:
            raise HTTPException(status_code=403, detail="Ви можете видаляти тільки свої відгуки")
    else:
        raise HTTPException(status_code=401, detail="Потрібна авторизація для видалення відгуків")
    
    await review_service.delete_review(review_id)
    
    return None


# Адмін endpoints для модерації
@router.get("/admin/pending")
async def get_pending_reviews(
    limit: int = Query(50, ge=1, le=100),
    all_reviews: bool = Query(False, description="Показати всі відгуки, не тільки на модерацію"),
    current_admin: TokenData = Depends(get_current_admin),
    review_service: ReviewService = Depends(get_review_service),
):
    """
    Отримує відгуки для модерації.
    Тільки для адміністраторів.
    Якщо all_reviews=True, повертає всі відгуки.
    """
    if all_reviews:
        # Отримуємо всі відгуки
        db = review_service.db
        reviews_raw = await db.reviews.find({}).sort("created_at", -1).limit(limit).to_list(length=limit)
        reviews = [review_service._serialize_review(r) for r in reviews_raw]
    else:
        # Тільки відгуки на модерацію
        reviews = await review_service.get_pending_reviews(limit=limit)
    return JSONResponse(content=reviews)


@router.post("/admin/{review_id}/moderate")
async def moderate_review(
    review_id: str,
    is_approved: bool = Query(..., description="Схвалити відгук"),
    moderator_comment: Optional[str] = Query(None, max_length=500, description="Коментар модератора"),
    current_admin: TokenData = Depends(get_current_admin),
    review_service: ReviewService = Depends(get_review_service),
):
    """
    Модерує відгук (схвалює або відхиляє).
    Тільки для адміністраторів.
    """
    logger.info(f"Адмін {current_admin.email} модерує відгук {review_id}: {'схвалено' if is_approved else 'відхилено'}")
    
    review = await review_service.moderate_review(
        review_id=review_id,
        is_approved=is_approved,
        moderator_comment=moderator_comment
    )
    
    return JSONResponse(content=review)


@router.delete("/admin/{review_id}", status_code=204)
async def admin_delete_review(
    review_id: str,
    current_admin: TokenData = Depends(get_current_admin),
    review_service: ReviewService = Depends(get_review_service),
):
    """
    Видаляє відгук (для адміністраторів).
    Тільки для адміністраторів.
    """
    logger.info(f"Адмін {current_admin.email} видаляє відгук {review_id}")
    
    await review_service.delete_review(review_id)
    
    return None

