from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CompanyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_id: str
    company_name: str
    legal_name: str
    ticker: str
    exchange: str
    sector: str
    industry: str
    created_at: datetime
    updated_at: datetime


class CompanyListResponse(BaseModel):
    data: list[CompanyResponse]
    total: int