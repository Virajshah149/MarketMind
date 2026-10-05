from typing import Literal

from pydantic import BaseModel, Field


class NewsAnalysis(BaseModel):
    news_id: int
    company_id: str | None
    event_type: str
    sentiment: Literal["positive", "negative", "neutral"]
    severity: float = Field(ge=0, le=1)
    confidence: float = Field(ge=0, le=1)
    summary: str


class BatchNewsAnalysis(BaseModel):
    analyses: list[NewsAnalysis]