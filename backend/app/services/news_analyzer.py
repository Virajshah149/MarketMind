from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.news import News
from app.services.llm_service import analyze_news


def analyze_news_item(
    db: Session,
    news_id: int,
):

    news = db.scalar(
        select(News).where(
            News.id == news_id
        )
    )

    if news is None:
        raise ValueError("News not found")

    companies = list(
        db.scalars(
            select(Company).order_by(
                Company.company_name
            )
        ).all()
    )

    company_data = [
        {
            "company_id": company.company_id,
            "company_name": company.company_name,
            "ticker": company.ticker,
        }
        for company in companies
    ]

    analysis = analyze_news(
        news_title=news.title,
        news_content=news.content,
        companies=company_data,
    )

    # -----------------------------------------------
    # Validate company returned by Gemini
    # -----------------------------------------------

    valid_company_ids = {
        company.company_id
        for company in companies
    }

    if (
        analysis.company_id is not None
        and analysis.company_id not in valid_company_ids
    ):
        raise ValueError(
            "Gemini returned an unknown company ID"
        )

    # -----------------------------------------------
    # Update news
    # -----------------------------------------------

    news.company_id = analysis.company_id
    news.event_type = analysis.event_type
    news.sentiment = analysis.sentiment
    news.severity = analysis.severity
    news.analysis_confidence = analysis.confidence
    news.summary = analysis.summary
    news.processing_status = "analyzed"

    db.commit()
    db.refresh(news)

    return news