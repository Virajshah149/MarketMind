from typing import Literal

from pydantic import BaseModel, Field


class NewsAnalysis(BaseModel):

    company_id: str | None = Field(
        default=None,
        description="ID of the company affected by the news."
    )

    event_type: str = Field(
        description=(
            "Type of event, such as production_disruption, "
            "supply_disruption, earnings, capacity_expansion, "
            "regulatory_change, acquisition, product_launch, "
            "management_change, commodity_cost_change, or other."
        )
    )

    sentiment: Literal[
        "positive",
        "negative",
        "neutral",
    ] = Field(
        description="Overall direction of the news."
    )

    severity: float = Field(
        ge=0,
        le=1,
        description=(
            "Significance of the event itself, from 0 to 1. "
            "This is NOT stock-price impact."
        ),
    )

    confidence: float = Field(
        ge=0,
        le=1,
        description=(
            "Confidence in identifying the company and event "
            "from 0 to 1."
        ),
    )

    summary: str = Field(
        description="Short factual summary of the news."
    )