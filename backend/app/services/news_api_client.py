from datetime import datetime, timedelta, timezone

import requests

from app.core.config import settings


NEWS_API_EVERYTHING_URL = "https://newsapi.org/v2/everything"
NEWS_API_TOP_HEADLINES_URL = "https://newsapi.org/v2/top-headlines"


def fetch_news(
    query: str,
    minutes_back: int = 60,
    page_size: int = 100,
):
    now = datetime.now(timezone.utc)

    from_time = now - timedelta(
        minutes=minutes_back
    )

    params = {
        "q": query,
        "from": from_time.isoformat(),
        "to": now.isoformat(),
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": page_size,
    }

    headers = {
        "X-Api-Key": settings.news_api_key,
    }

    response = requests.get(
        NEWS_API_EVERYTHING_URL,
        params=params,
        headers=headers,
        timeout=30,
    )

    response.raise_for_status()

    data = response.json()

    if data.get("status") != "ok":
        raise RuntimeError(
            data.get(
                "message",
                "NewsAPI request failed",
            )
        )

    return data.get("articles", [])


def fetch_india_business_headlines(
    page_size: int = 100,
):
    params = {
        "country": "in",
        "category": "business",
        "pageSize": page_size,
    }

    headers = {
        "X-Api-Key": settings.news_api_key,
    }

    response = requests.get(
        NEWS_API_TOP_HEADLINES_URL,
        params=params,
        headers=headers,
        timeout=30,
    )

    response.raise_for_status()

    data = response.json()

    if data.get("status") != "ok":
        raise RuntimeError(
            data.get(
                "message",
                "NewsAPI request failed",
            )
        )

    return data.get("articles", [])