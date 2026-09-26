from collections import deque

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.relationship import Relationship


def get_impact_level(impact: float) -> str:
    if impact >= 0.70:
        return "high"

    if impact >= 0.30:
        return "medium"

    if impact >= 0.10:
        return "low"

    return "minimal"


def simulate_shock(
    db: Session,
    source_company_id: str,
    shock_type: str,
    shock_strength: float,
    max_hops: int,
    minimum_impact: float,
    hop_decay: float,
):
    # ---------------------------------------------------------
    # 1. Check that the source company exists
    # ---------------------------------------------------------

    company_statement = select(Company).where(
        Company.company_id == source_company_id
    )

    source_company = db.scalar(company_statement)

    if source_company is None:
        raise ValueError("Source company not found")

    # ---------------------------------------------------------
    # 2. Load relationships
    # ---------------------------------------------------------

    relationships = list(
        db.scalars(
            select(Relationship)
        ).all()
    )

    # ---------------------------------------------------------
    # 3. Build directed graph
    # ---------------------------------------------------------

    graph = {}

    for relationship in relationships:
        graph.setdefault(
            relationship.source_company_id,
            []
        ).append(relationship)

    # ---------------------------------------------------------
    # 4. Initial shock
    # ---------------------------------------------------------

    queue = deque(
        [
            (
                source_company_id,
                0,
                shock_strength,
            )
        ]
    )

    visited = {
        source_company_id: shock_strength
    }

    nodes = [
        {
            "company_id": source_company_id,
            "hop": 0,
            "impact": round(shock_strength, 4),
            "impact_level": get_impact_level(
                shock_strength
            ),
        }
    ]

    edges = []

    # ---------------------------------------------------------
    # 5. Traverse graph
    # ---------------------------------------------------------

    while queue:

        (
            current_company,
            current_hop,
            current_impact,
        ) = queue.popleft()

        if current_hop >= max_hops:
            continue

        relationships_from_company = graph.get(
            current_company,
            [],
        )

        for relationship in relationships_from_company:

            # -------------------------------------------------
            # Dependency factor
            #
            # If dependency is unknown, use 1.0
            # -------------------------------------------------

            dependency_factor = (
                relationship.dependency_percentage
                if relationship.dependency_percentage is not None
                else 1.0
            )

            # -------------------------------------------------
            # Calculate propagated impact
            # -------------------------------------------------

            next_impact = (
                current_impact
                * relationship.strength
                * dependency_factor
                * relationship.confidence_score
                * hop_decay
            )

            # Ignore insignificant propagation
            if next_impact < minimum_impact:
                continue

            target = relationship.target_company_id

            previous_impact = visited.get(
                target,
                0,
            )

            # Keep strongest path to a company
            if next_impact <= previous_impact:
                continue

            visited[target] = next_impact

            edges.append(
                {
                    "source_company_id": current_company,
                    "target_company_id": target,
                     "relationship_id": relationship.id,
                    "relationship_type": relationship.relationship_type,
                    "strength": relationship.strength,
                    "dependency_percentage": relationship.dependency_percentage,
                    "confidence_score": relationship.confidence_score,
                    "propagated_impact": round(
                        next_impact,
                        4,
                    ),
                }
            )

            nodes.append(
                {
                    "company_id": target,
                    "hop": current_hop + 1,
                    "impact": round(
                        next_impact,
                        4,
                    ),
                    "impact_level": get_impact_level(
                        next_impact
                    ),
                }
            )

            queue.append(
                (
                    target,
                    current_hop + 1,
                    next_impact,
                )
            )

    return {
        "source_company_id": source_company_id,
        "shock_type": shock_type,
        "shock_strength": shock_strength,
        "nodes": nodes,
        "edges": edges,
    }