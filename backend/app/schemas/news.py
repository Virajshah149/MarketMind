from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class NewsCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)

    content: str = Field(
        min_length=10,
    )

    source_name: str | None = None
    source_url: str | None = None
    published_at: datetime | None = None


class NewsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    source_name: str | None
    source_url: str | None
    published_at: datetime | None

    company_id: str | None
    event_type: str | None
    sentiment: str | None
    severity: float | None
    analysis_confidence: float | None
    summary: str | None

    processing_status: str
    created_at: datetime


class NewsListResponse(BaseModel):
    data: list[NewsResponse]
    total: int