from typing import Literal

from pydantic import BaseModel, Field


class NewsAnalysis(BaseModel):
    news_id: int

    company_id: str | None

    event_type: str

    sentiment: Literal[
        "positive",
        "negative",
        "neutral",
    ]

    severity: float = Field(
        ge=0,
        le=1,
    )

    confidence: float = Field(
        ge=0,
        le=1,
    )

    summary: str

    # ---------------------------------------------------------
    # Relationship change
    # ---------------------------------------------------------

    relationship_change: Literal[
        "none",
        "strengthen",
        "weaken",
        "create",
        "remove",
    ] = "none"

    related_company_id: str | None = None

    relationship_type: str | None = None

    relationship_change_strength: float = Field(
        default=0,
        ge=0,
        le=1,
    )
    

class BatchNewsAnalysis(BaseModel):
    analyses: list[NewsAnalysis]