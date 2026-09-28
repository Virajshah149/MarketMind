from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.news_analyzer import analyze_news_item
from app.db.session import get_db
from app.schemas.impact import ImpactResponse
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


from app.services.event_pipeline import process_news_event

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





@router.post(
    "/{news_id}/analyze",
    response_model=NewsResponse,
)
def analyze_news_endpoint(
    news_id: int,
    db: Session = Depends(get_db),
):
    try:
        return analyze_news_item(
            db=db,
            news_id=news_id,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        print(f"NEWS ANALYSIS ERROR: {error}")

        raise HTTPException(
            status_code=500,
            detail=f"News analysis failed: {error}",
        )



@router.post("/{news_id}/process")
def process_news_endpoint(news_id: int, db: Session = Depends(get_db)):
    try:
        result = process_news_event(
            db=db,
            news_id=news_id,
        )

        result["impacts"] = [
            ImpactResponse.model_validate(impact).model_dump(mode="json")
            for impact in result["impacts"]
        ]

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )