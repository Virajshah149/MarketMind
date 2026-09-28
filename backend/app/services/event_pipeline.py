from datetime import datetime
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.news import News
from app.services.impact_service import save_impacts
from app.services.simulation_service import simulate_shock


def process_news_event(
    db: Session,
    news_id: int,
):
    # --------------------------------------------------
    # 1. Get analyzed news
    # --------------------------------------------------

    news = db.scalar(
        select(News).where(
            News.id == news_id
        )
    )

    if news is None:
        raise ValueError("News not found")

    if news.processing_status != "analyzed":
        raise ValueError(
            "News must be analyzed by Gemini first"
        )

    if news.company_id is None:
        raise ValueError(
            "No company was identified in the news"
        )

    if news.severity is None:
        raise ValueError(
            "News severity is missing"
        )

    if news.sentiment is None:
        raise ValueError(
            "News sentiment is missing"
        )

    # --------------------------------------------------
    # 2. Convert sentiment into shock type
    # --------------------------------------------------

    if news.sentiment == "positive":
        shock_type = "positive"

    elif news.sentiment == "negative":
        shock_type = "negative"

    else:
        raise ValueError(
            "Neutral news does not generate a shock"
        )

    # --------------------------------------------------
    # 3. Create Event
    # --------------------------------------------------

    existing_event = db.scalar(
        select(Event).where(
            Event.source_url == news.source_url
        )
    ) if news.source_url else None

    if existing_event is None:

        event = Event(
            event_id=f"EVT-{uuid4().hex[:10].upper()}",
            company_id=news.company_id,
            event_type=news.event_type or "other",
            title=news.title,
            description=news.summary or news.content,
            shock_type=shock_type,
            shock_strength=news.severity,
            event_date=(
                news.published_at
                or datetime.utcnow()
            ),
            source_name=news.source_name,
            source_url=news.source_url,
        )

        db.add(event)
        db.commit()
        db.refresh(event)

    else:
        event = existing_event

    # --------------------------------------------------
    # 4. Run shock simulation
    # --------------------------------------------------

    simulation = simulate_shock(
        db=db,
        source_company_id=news.company_id,
        shock_type=shock_type,
        shock_strength=news.severity,
        max_hops=4,
        minimum_impact=0.01,
    )

    # --------------------------------------------------
    # 5. Store impact results
    # --------------------------------------------------

    impacts = save_impacts(
        db=db,
        news_id=news.id,
        source_company_id=news.company_id,
        shock_type=shock_type,
        nodes=simulation["nodes"],
        edges=simulation["edges"],
    )

    news.processing_status = "processed"

    db.commit()
    db.refresh(news)

    return {
        "news_id": news.id,
        "event_id": event.event_id,
        "source_company_id": news.company_id,
        "shock_type": shock_type,
        "shock_strength": news.severity,
        "impacts": impacts,
    }