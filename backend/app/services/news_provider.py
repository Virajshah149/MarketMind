from dataclasses import dataclass
from datetime import datetime


@dataclass
class NewsArticle:
    title: str
    content: str | None
    source_name: str | None
    source_url: str
    published_at: datetime | None


class NewsProvider:
    def fetch(self) -> list[NewsArticle]:
        raise NotImplementedError