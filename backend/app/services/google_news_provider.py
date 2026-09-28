from datetime import datetime
from email.utils import parsedate_to_datetime
from urllib.parse import quote

import feedparser

from app.services.news_provider import (
    NewsArticle,
    NewsProvider,
)


GOOGLE_NEWS_RSS_URL = (
    "https://news.google.com/rss/search?q={query}&hl=en-IN&gl=IN&ceid=IN:en"
)


class GoogleNewsProvider(NewsProvider):

    def __init__(
        self,
        query: str,
        max_records: int = 20,
    ):
        self.query = query
        self.max_records = max_records

    def fetch(self) -> list[NewsArticle]:

        url = GOOGLE_NEWS_RSS_URL.format(
            query=quote(self.query)
        )

        feed = feedparser.parse(url)

        articles = []

        for entry in feed.entries[:self.max_records]:

            published_at = None

            if entry.get("published"):
                try:
                    published_at = parsedate_to_datetime(
                        entry.published
                    )
                except (TypeError, ValueError):
                    published_at = None

            articles.append(
                NewsArticle(
                    title=entry.get(
                        "title",
                        "",
                    ),
                    content=entry.get(
                        "summary"
                    ),
                    source_name=(
                        entry.get("source", {}).get("title")
                        if entry.get("source")
                        else None
                    ),
                    source_url=entry.get(
                        "link",
                        "",
                    ),
                    published_at=published_at,
                )
            )

        return articles