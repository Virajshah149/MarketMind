from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.news import News
from app.services.company_matcher import find_company_mentions
from app.services.google_news_provider import GoogleNewsProvider
from app.services.news_deduplicator import is_duplicate_news


def collect_company_news(
    db: Session,
    company_name: str,
    max_records: int = 20,
) -> dict:

    provider = GoogleNewsProvider(
        query=f'"{company_name}"',
        max_records=max_records,
    )

    articles = provider.fetch()

    fetched = len(articles)
    matched = 0
    duplicates = 0
    inserted = 0

    for article in articles:

        # 1. Find our companies
        matches = find_company_mentions(
            db=db,
            title=article.title,
            content=article.content,
        )

        if not matches:
            continue

        matched += 1

        # 2. Check duplicate
        duplicate_result = is_duplicate_news(
            db=db,
            title=article.title,
            source_url=article.source_url,
        )

        if duplicate_result["is_duplicate"]:
            duplicates += 1
            continue

        # 3. Select primary company
        primary_company_id = None

        for match in matches:
            if match["company_name"].lower() == company_name.lower():
                primary_company_id = match["company_id"]
                break

        if primary_company_id is None:
            primary_company_id = matches[0]["company_id"]

        # 4. Insert news
        news = News(
            title=article.title,
            content=article.content or article.title,
            source_name=article.source_name,
            source_url=article.source_url,
            published_at=article.published_at,
            company_id=primary_company_id,
            processing_status="pending",
            created_by="system",
            source_type="automatic",
        )

        db.add(news)
        inserted += 1

    db.commit()

    return {
        "company_query": company_name,
        "fetched": fetched,
        "matched": matched,
        "duplicates": duplicates,
        "inserted": inserted,
    }