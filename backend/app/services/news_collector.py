from sqlalchemy.orm import Session

from app.services.company_matcher import find_company_mentions
from app.services.google_news_provider import GoogleNewsProvider
from app.services.news_deduplicator import is_duplicate_news


def collect_company_news(
    db: Session,
    company_name: str,
    max_records: int = 20,
) -> dict:
    """
    Fetch Google News RSS articles for one company,
    filter unrelated articles,
    remove duplicates,
    and return the articles that are safe to process.

    Nothing is inserted into the database yet.
    """

    provider = GoogleNewsProvider(
        query=f'"{company_name}"',
        max_records=max_records,
    )

    articles = provider.fetch()

    fetched = len(articles)
    matched = 0
    duplicates = 0
    accepted = 0

    accepted_articles = []

    for article in articles:

        # ---------------------------------------------------------
        # 1. Check whether article mentions one of our 50 companies
        # ---------------------------------------------------------

        matches = find_company_mentions(
            db=db,
            title=article.title,
            content=article.content,
        )

        if not matches:
            continue

        matched += 1

        # ---------------------------------------------------------
        # 2. Check duplicate
        # ---------------------------------------------------------

        duplicate_result = is_duplicate_news(
            db=db,
            title=article.title,
            source_url=article.source_url,
        )

        if duplicate_result["is_duplicate"]:
            duplicates += 1
            continue

        # ---------------------------------------------------------
        # 3. Keep article for next pipeline stage
        # ---------------------------------------------------------

        accepted += 1

        accepted_articles.append(
            {
                "title": article.title,
                "content": article.content,
                "source_name": article.source_name,
                "source_url": article.source_url,
                "published_at": article.published_at,
                "company_matches": matches,
            }
        )

    return {
        "company_query": company_name,
        "fetched": fetched,
        "matched": matched,
        "duplicates": duplicates,
        "accepted": accepted,
        "articles": accepted_articles,
    }