from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.schemas.news import (
    NewsCreate,
    NewsListResponse,
    NewsResponse,
)

from app.services.news_service import (
    create_news,
    get_news,
    get_news_item,
)


router = APIRouter(
    prefix="/news",
    tags=["News"],
)


@router.get(
    "",
    response_model=NewsListResponse,
)
def list_news(
    db: Session = Depends(get_db),
):

    news = get_news(db)

    return {
        "data": news,
        "total": len(news),
    }


@router.post(
    "",
    response_model=NewsResponse,
)
def add_news(
    data: NewsCreate,
    db: Session = Depends(get_db),
):

    return create_news(
        db,
        data,
    )


@router.get(
    "/{news_id}",
    response_model=NewsResponse,
)
def news_details(
    news_id: int,
    db: Session = Depends(get_db),
):

    news = get_news_item(
        db,
        news_id,
    )

    if news is None:

        raise HTTPException(
            status_code=404,
            detail="News not found",
        )

    return news