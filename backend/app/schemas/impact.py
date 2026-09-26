from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ImpactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    news_id: int
    source_company_id: str
    affected_company_id: str
    relationship_id: int | None
    hop: int
    impact: float
    impact_level: str
    shock_type: str
    created_at: datetime


class ImpactListResponse(BaseModel):
    data: list[ImpactResponse]
    total: int