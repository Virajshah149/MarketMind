from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class RelationshipResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    source_company_id: str
    target_company_id: str
    relationship_type: str
    strength: float
    dependency_percentage: float | None
    commodity: str | None
    evidence_text: str | None
    evidence_source: str | None
    confidence_score: float
    created_at: datetime


class RelationshipCreate(BaseModel):
    source_company_id: str
    target_company_id: str
    relationship_type: str
    strength: float = Field(ge=0, le=1)
    dependency_percentage: float | None = Field(
        default=None,
        ge=0,
        le=1,
    )
    commodity: str | None = None
    evidence_text: str | None = None
    evidence_source: str | None = None
    confidence_score: float = Field(
        default=0.5,
        ge=0,
        le=1,
    )


class RelationshipListResponse(BaseModel):
    data: list[RelationshipResponse]
    total: int