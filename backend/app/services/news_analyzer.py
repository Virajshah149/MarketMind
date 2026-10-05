from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.news import News
from app.services.company_matcher import find_company_mentions
from app.services.llm_service import analyze_news_batch


MAX_CONTENT_CHARS = 1200


NOISE_PHRASES = [
    "share price live updates",
    "stock price live updates",
    "stocks to watch",
    "top stocks to buy",
    "target price",
    "buy or sell",
    "technical analysis",
    "support and resistance",
    "intraday",
    "52-week high",
    "52-week low",
    "stock market today",
    "market today",
    "share price today",
    "investors should watch",
    "investors should know",
    "what investors should watch",
    "what investors should know",
    "buying opportunity",
    "dip buying opportunity",
    "stocks under pressure",
    "metal stocks fall",
    "steel prices",
    "stock outlook",
    "share outlook",
    "market outlook",
]


def trim_content(
    content: str | None,
) -> str:
    if not content:
        return ""

    content = content.strip()

    if len(content) <= MAX_CONTENT_CHARS:
        return content

    return content[:MAX_CONTENT_CHARS] + "..."


def is_low_value_news(
    title: str,
    content: str | None,
) -> bool:

    text = (
        f"{title} {content or ''}"
    ).lower()

    return any(
        phrase in text
        for phrase in NOISE_PHRASES
    )


def prepare_news_for_gemini(
    db: Session,
    news: News,
) -> dict | None:

    # --------------------------------------------------
    # Cheap filter — NO Gemini request
    # --------------------------------------------------

    if is_low_value_news(
        title=news.title,
        content=news.content,
    ):
        news.processing_status = "skipped"
        news.event_type = "market_commentary"
        news.sentiment = "neutral"
        news.severity = 0
        news.analysis_confidence = 1
        news.summary = (
            "Skipped because this appears to be "
            "market commentary rather than a company event."
        )

        return None

    # --------------------------------------------------
    # Find companies already mentioned
    # --------------------------------------------------

    matches = find_company_mentions(
        db=db,
        title=news.title,
        content=news.content,
    )

    if not matches:
        news.processing_status = "skipped"
        news.event_type = "irrelevant"
        news.sentiment = "neutral"
        news.severity = 0
        news.analysis_confidence = 1
        news.summary = (
            "No supported NIFTY 50 company was identified."
        )

        return None

    companies_text = "\n".join(
        f"{match['company_id']} | "
        f"{match['company_name']}"
        for match in matches
    )

    return {
        "news_id": news.id,
        "title": news.title[:500],
        "content": trim_content(
            news.content
        ),
        "companies": companies_text,
    }


def analyze_pending_news_batch(
    db: Session,
    limit: int = 10,
) -> list[News]:

    # --------------------------------------------------
    # Get pending news
    # --------------------------------------------------

    pending_news = db.scalars(
        select(News)
        .where(
            News.processing_status == "pending"
        )
        .order_by(
            News.created_at.asc()
        )
        .limit(limit)
    ).all()

    if not pending_news:
        return []

    # --------------------------------------------------
    # Cheap filtering
    # --------------------------------------------------

    articles_for_gemini = []

    for news in pending_news:
        prepared = prepare_news_for_gemini(
            db=db,
            news=news,
        )

        if prepared is not None:
            articles_for_gemini.append(
                prepared
            )

    # --------------------------------------------------
    # Nothing meaningful
    # --------------------------------------------------

    if not articles_for_gemini:
        db.commit()
        return pending_news

    # --------------------------------------------------
    # ONE Gemini request
    # --------------------------------------------------

    batch_result = analyze_news_batch(
        articles=articles_for_gemini
    )

    analyses_by_id = {
        analysis.news_id: analysis
        for analysis in batch_result.analyses
    }

    # --------------------------------------------------
    # Apply Gemini results
    # --------------------------------------------------

    for news in pending_news:

        analysis = analyses_by_id.get(
            news.id
        )

        if analysis is None:
            continue

        news.company_id = analysis.company_id
        news.event_type = analysis.event_type
        news.sentiment = analysis.sentiment
        news.severity = analysis.severity
        news.analysis_confidence = analysis.confidence
        news.summary = analysis.summary

        if analysis.company_id is None:
            news.processing_status = "skipped"
        else:
            news.processing_status = "analyzed"

    db.commit()

    for news in pending_news:
        db.refresh(news)

    return pending_news


def analyze_news_item(
    db: Session,
    news_id: int,
):
    """
    Existing single-news analysis endpoint.
    """

    news = db.scalar(
        select(News).where(
            News.id == news_id
        )
    )

    if news is None:
        raise ValueError(
            "News not found"
        )

    if news.processing_status in {
        "analyzed",
        "processed",
        "skipped",
    }:
        return news

    result = analyze_pending_news_batch(
        db=db,
        limit=1,
    )

    for item in result:
        if item.id == news_id:
            return item

    return news