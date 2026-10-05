from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class EventCreate(BaseModel):
    event_id: str = Field(min_length=1, max_length=50)
    company_id: str
    event_type: str
    title: str
    description: str | None = None
    shock_type: str
    shock_strength: float = Field(ge=0, le=1)
    event_date: datetime
    source_name: str | None = None
    source_url: str | None = None


class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_id: str
    company_id: str
    event_type: str
    title: str
    description: str | None
    shock_type: str
    shock_strength: float
    event_date: datetime
    source_name: str | None
    source_url: str | None
    created_at: datetime


class EventListResponse(BaseModel):
    data: list[EventResponse]
    total: int