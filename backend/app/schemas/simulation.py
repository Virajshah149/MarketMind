from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    source_company_id: str

    shock_type: str = Field(
        default="negative",
        pattern="^(positive|negative)$",
    )

    shock_strength: float = Field(
        default=1.0,
        ge=0,
        le=1,
    )

    max_hops: int = Field(
        default=4,
        ge=1,
        le=10,
    )

    minimum_impact: float = Field(
        default=0.01,
        ge=0,
        le=1,
    )

    hop_decay: float = Field(
        default=0.8,
        ge=0,
        le=1,
    )


class SimulationNode(BaseModel):
    company_id: str
    hop: int
    impact: float
    impact_level: str


class SimulationEdge(BaseModel):
    source_company_id: str
    target_company_id: str
    relationship_id: int
    relationship_type: str
    strength: float
    dependency_percentage: float | None
    confidence_score: float
    propagated_impact: float


class SimulationResponse(BaseModel):
    source_company_id: str
    shock_type: str
    shock_strength: float
    nodes: list[SimulationNode]
    edges: list[SimulationEdge]