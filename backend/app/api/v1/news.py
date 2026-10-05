from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.news import News
from app.schemas.impact import ImpactResponse
from app.schemas.news import NewsCreate, NewsListResponse, NewsResponse
from app.services.event_pipeline import process_news_event
from app.services.news_analyzer import analyze_news_item
from app.services.news_service import create_news, get_news, get_news_item
from app.services.news_analyzer import (
    analyze_pending_news_batch,
)
router = APIRouter(prefix="/news", tags=["News"])


@router.get("", response_model=NewsListResponse)
def list_news(db: Session = Depends(get_db)):
    news = get_news(db)
    return {"data": news, "total": len(news)}


@router.post("", response_model=NewsResponse)
def add_news(
    data: NewsCreate,
    db: Session = Depends(get_db),
):
    return create_news(db, data)


@router.get("/{news_id}", response_model=NewsResponse)
def news_details(
    news_id: int,
    db: Session = Depends(get_db),
):
    news = get_news_item(db, news_id)

    if news is None:
        raise HTTPException(
            status_code=404,
            detail="News not found",
        )

    return news


@router.post("/{news_id}/analyze", response_model=NewsResponse)
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
def process_news_endpoint(
    news_id: int,
    db: Session = Depends(get_db),
):
    try:
        result = process_news_event(
            db=db,
            news_id=news_id,
        )

        result["impacts"] = [
            ImpactResponse.model_validate(impact).model_dump(
                mode="json"
            )
            for impact in result["impacts"]
        ]

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        print(f"NEWS PROCESSING ERROR: {error}")

        raise HTTPException(
            status_code=500,
            detail=f"News processing failed: {error}",
        )



@router.post("/process-pending")
def process_pending_news(
    limit: int = 10,
    db: Session = Depends(get_db),
):
    """
    Analyze a batch of pending news using one Gemini request,
    then run the shock engine on analyzed articles.
    """

    if limit < 1:
        limit = 1

    if limit > 10:
        limit = 10

    try:
        news_items = analyze_pending_news_batch(
            db=db,
            limit=limit,
        )

    except Exception as error:
        db.rollback()

        return {
            "requested": limit,
            "gemini_status": "failed",
            "processed_count": 0,
            "skipped_count": 0,
            "failed_count": 0,
            "error": str(error),
        }

    results = []

    for news in news_items:

        # Cheap-filtered articles
        if news.processing_status == "skipped":
            results.append({
                "news_id": news.id,
                "status": "skipped",
            })
            continue

        # Gemini could not identify company
        if not news.company_id:
            results.append({
                "news_id": news.id,
                "status": "skipped",
                "reason": "No company identified",
            })
            continue

        try:
            result = process_news_event(
                db=db,
                news_id=news.id,
            )

            results.append({
                "news_id": news.id,
                "status": "processed",
                "company_id": news.company_id,
                "impacts": len(
                    result["impacts"]
                ),
            })

        except Exception as error:
            db.rollback()

            results.append({
                "news_id": news.id,
                "status": "failed",
                "error": str(error),
            })

    return {
        "requested": limit,
        "gemini_status": "success",
        "found": len(news_items),
        "processed_count": sum(
            1
            for result in results
            if result["status"] == "processed"
        ),
        "skipped_count": sum(
            1
            for result in results
            if result["status"] == "skipped"
        ),
        "failed_count": sum(
            1
            for result in results
            if result["status"] == "failed"
        ),
        "results": results,
    }