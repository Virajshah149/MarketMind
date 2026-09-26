from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class EvidenceCreate(BaseModel):
    relationship_id: int
    evidence_type: str = Field(min_length=1, max_length=50)
    title: str | None = None
    evidence_text: str = Field(min_length=1)
    source_name: str | None = None
    source_url: str | None = None
    published_date: datetime | None = None
    verification_status: str = "unverified"


class EvidenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    relationship_id: int
    evidence_type: str
    title: str | None
    evidence_text: str
    source_name: str | None
    source_url: str | None
    published_date: datetime | None
    verification_status: str
    created_at: datetime


class EvidenceListResponse(BaseModel):
    data: list[EvidenceResponse]
    total: int