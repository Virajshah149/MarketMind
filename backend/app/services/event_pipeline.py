from datetime import datetime
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.news import News

from app.services.impact_service import save_impacts
from app.services.relationship_service import apply_relationship_change
from app.services.simulation_service import simulate_shock


def process_news_event(
    db: Session,
    news_id: int,
    relationship_change: str = "none",
    related_company_id: str | None = None,
    relationship_type: str | None = None,
    relationship_change_strength: float = 0.0,
):
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

    # ---------------------------------------------------------
    # Determine shock type
    # ---------------------------------------------------------

    if news.sentiment == "positive":
        shock_type = "positive"

    elif news.sentiment == "negative":
        shock_type = "negative"

    else:
        shock_type = "neutral"

    # ---------------------------------------------------------
    # Apply relationship change
    # ---------------------------------------------------------

    relationship = None

    if (
        relationship_change != "none"
        and related_company_id
    ):
        relationship = apply_relationship_change(
            db=db,
            source_company_id=news.company_id,
            target_company_id=related_company_id,
            relationship_change=relationship_change,
            relationship_type=relationship_type,
            change_strength=relationship_change_strength,
        )

    # ---------------------------------------------------------
    # Create event
    # ---------------------------------------------------------

    existing_event = None

    if news.source_url:

        existing_event = db.scalar(
            select(Event).where(
                Event.source_url == news.source_url
            )
        )

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

    # ---------------------------------------------------------
    # Neutral news does not create a shock
    # ---------------------------------------------------------

    if shock_type == "neutral":

        news.processing_status = "processed"

        db.commit()
        db.refresh(news)

        return {
            "news_id": news.id,
            "event_id": event.event_id,
            "source_company_id": news.company_id,
            "shock_type": "neutral",
            "shock_strength": 0,
            "relationship_change": relationship_change,
            "related_company_id": related_company_id,
            "impacts": [],
        }

    # ---------------------------------------------------------
    # Run shock simulation
    # ---------------------------------------------------------

    simulation = simulate_shock(
        db=db,
        source_company_id=news.company_id,
        shock_type=shock_type,
        shock_strength=news.severity,
        max_hops=4,
        minimum_impact=0.01,
    )

    # ---------------------------------------------------------
    # Save impacts
    # ---------------------------------------------------------

    impacts = save_impacts(
        db=db,
        news_id=news.id,
        source_company_id=news.company_id,
        shock_type=shock_type,
        nodes=simulation.nodes,
        edges=simulation.edges,
    )

    # ---------------------------------------------------------
    # Finish
    # ---------------------------------------------------------

    news.processing_status = "processed"

    db.commit()
    db.refresh(news)

    return {
        "news_id": news.id,
        "event_id": event.event_id,
        "source_company_id": news.company_id,
        "shock_type": shock_type,
        "shock_strength": news.severity,
        "relationship_change": relationship_change,
        "related_company_id": related_company_id,
        "relationship_changed": relationship is not None,
        "impacts": impacts,
    }