from pydantic import BaseModel


class GraphNode(BaseModel):
    company_id: str
    company_name: str
    ticker: str
    sector: str
    industry: str


class GraphEdge(BaseModel):
    source: str
    target: str
    relationship_type: str
    strength: float
    dependency_percentage: float | None
    commodity: str | None


class GraphResponse(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]