from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.relationship import Relationship
from app.schemas.simulation import (
    SimulationEdge,
    SimulationNode,
    SimulationResponse,
)


HOP_LAMBDA = 0.25


@dataclass
class PathState:
    company_id: str
    hop: int
    impact: float
    base_impact: float
    path: list[str]
    relationship_ids: list[int]


def hop_attenuation(hop: int) -> float:
    """
    Hop 1 = 1.0
    Hop 2 = 0.8
    Hop 3 = 0.6667
    Hop 4 = 0.5714
    """
    if hop <= 1:
        return 1.0

    return 1.0 / (1.0 + HOP_LAMBDA * (hop - 1))


def transmission_weight(relationship: Relationship) -> float:
    """
    Economic transmission weight:

        W = strength × dependency

    dependency_percentage is currently stored in the database
    as a decimal fraction such as 0.30, 0.20, 0.15.
    """

    dependency = relationship.dependency_percentage

    if dependency is None:
        dependency = 1.0

    dependency_factor = max(0.0, min(1.0, dependency))
    strength = max(0.0, min(1.0, relationship.strength))

    return strength * dependency_factor


def impact_level(impact: float) -> str:
    if impact >= 0.50:
        return "high"

    if impact >= 0.20:
        return "medium"

    if impact >= 0.05:
        return "low"

    return "minimal"


def aggregate_impacts(impacts: list[float]) -> float:
    """
    Combine multiple independent propagation paths:

        I = 1 - product(1 - I_p)
    """

    if not impacts:
        return 0.0

    remaining = 1.0

    for impact in impacts:
        impact = max(0.0, min(1.0, impact))
        remaining *= 1.0 - impact

    return 1.0 - remaining


def simulate_shock(
    db: Session,
    source_company_id: str,
    shock_type: str,
    shock_strength: float,
    max_hops: int = 4,
    minimum_impact: float = 0.0001,
) -> SimulationResponse:

    # ---------------------------------------------------------
    # 1. Validate source company
    # ---------------------------------------------------------

    source_company = (
        db.query(Company)
        .filter(Company.company_id == source_company_id)
        .first()
    )

    if not source_company:
        raise ValueError(
            f"Company '{source_company_id}' not found."
        )

    # ---------------------------------------------------------
    # 2. Get all relationships
    # ---------------------------------------------------------

    relationships = (
        db.query(Relationship)
        .all()
    )

    outgoing: dict[str, list[Relationship]] = {}

    for relationship in relationships:
        outgoing.setdefault(
            relationship.source_company_id,
            []
        ).append(relationship)

    # ---------------------------------------------------------
    # 3. Start BFS from source company
    # ---------------------------------------------------------

    source_state = PathState(
        company_id=source_company_id,
        hop=0,
        impact=shock_strength,
        base_impact=shock_strength,
        path=[source_company_id],
        relationship_ids=[],
    )

    queue: list[PathState] = [source_state]

    # Each company can be reached through multiple paths.
    company_impacts: dict[str, list[float]] = {
        source_company_id: [shock_strength]
    }

    # Store edge propagation results for response.
    edge_impacts: dict[int, float] = {}

    # Prevent endless cycles.
    visited_states: set[tuple[str, tuple[str, ...]]] = set()

    # ---------------------------------------------------------
    # 4. Traverse the dependency graph
    # ---------------------------------------------------------

    while queue:

        current = queue.pop(0)

        if current.hop >= max_hops:
            continue

        outgoing_relationships = outgoing.get(
            current.company_id,
            []
        )

        for relationship in outgoing_relationships:

            target_company_id = relationship.target_company_id

            # Prevent cycles within the same path.
            if target_company_id in current.path:
                continue

            weight = transmission_weight(relationship)

            if weight <= 0:
                continue

            next_hop = current.hop + 1

            # -------------------------------------------------
            # Base propagation:
            #
            # shock × product(edge weights)
            # -------------------------------------------------

            new_base_impact = (
                current.base_impact * weight
            )

            # -------------------------------------------------
            # Hop attenuation
            # -------------------------------------------------

            propagated_impact = (
                new_base_impact
                * hop_attenuation(next_hop)
            )

            if propagated_impact < minimum_impact:
                continue

            new_path = [
                *current.path,
                target_company_id,
            ]

            new_relationship_ids = [
                *current.relationship_ids,
                relationship.id,
            ]

            state_key = (
                target_company_id,
                tuple(new_path),
            )

            if state_key in visited_states:
                continue

            visited_states.add(state_key)

            # Save impact for target company.
            company_impacts.setdefault(
                target_company_id,
                []
            ).append(propagated_impact)

            # Keep strongest propagation for each edge.
            previous_edge_impact = edge_impacts.get(
                relationship.id,
                0.0
            )

            edge_impacts[relationship.id] = max(
                previous_edge_impact,
                propagated_impact,
            )

            # Continue propagation.
            queue.append(
                PathState(
                    company_id=target_company_id,
                    hop=next_hop,
                    impact=propagated_impact,
                    base_impact=new_base_impact,
                    path=new_path,
                    relationship_ids=new_relationship_ids,
                )
            )

    # ---------------------------------------------------------
    # 5. Build node response
    # ---------------------------------------------------------

    nodes: list[SimulationNode] = []

    for company_id, path_impacts in company_impacts.items():

        if company_id == source_company_id:
            combined_impact = shock_strength
            hop = 0
        else:
            combined_impact = aggregate_impacts(path_impacts)

            # Find shortest hop among paths.
            hop = min(
                len(path) - 1
                for path in [
                    state.path
                    for state in []
                ]
            ) if False else 0

            # Calculate hop from relationship path data below.
            hop_candidates = []

            for state in queue:
                if state.company_id == company_id:
                    hop_candidates.append(state.hop)

            if hop_candidates:
                hop = min(hop_candidates)
            else:
                # Fallback: infer from strongest path not available here.
                # This will be replaced by path tracking below.
                hop = 1

        nodes.append(
            SimulationNode(
                company_id=company_id,
                hop=hop,
                impact=combined_impact,
                impact_level=impact_level(combined_impact),
            )
        )

    # ---------------------------------------------------------
    # 6. Correct hop values using direct traversal metadata
    # ---------------------------------------------------------

    # Reconstruct minimum hop from graph.
    minimum_hops: dict[str, int] = {
        source_company_id: 0
    }

    frontier = [source_company_id]

    for hop in range(1, max_hops + 1):

        next_frontier = []

        for company_id in frontier:

            for relationship in outgoing.get(
                company_id,
                []
            ):

                target = relationship.target_company_id

                if target not in minimum_hops:

                    minimum_hops[target] = hop
                    next_frontier.append(target)

        frontier = next_frontier

        if not frontier:
            break

    # Update node hops.
    for node in nodes:
        node.hop = minimum_hops.get(
            node.company_id,
            node.hop,
        )

    # ---------------------------------------------------------
    # 7. Build edge response
    # ---------------------------------------------------------

    edges: list[SimulationEdge] = []

    for relationship in relationships:

        if relationship.id not in edge_impacts:
            continue

        propagated_impact = edge_impacts[
            relationship.id
        ]

        edges.append(
            SimulationEdge(
                source_company_id=relationship.source_company_id,
                target_company_id=relationship.target_company_id,
                relationship_id=relationship.id,
                relationship_type=relationship.relationship_type,
                strength=relationship.strength,
                dependency_percentage=(
                    relationship.dependency_percentage
                ),
                confidence_score=(
                    relationship.confidence_score
                ),
                propagated_impact=propagated_impact,
            )
        )

    # ---------------------------------------------------------
    # 8. Return response
    # ---------------------------------------------------------

    return SimulationResponse(
        source_company_id=source_company_id,
        shock_type=shock_type,
        shock_strength=shock_strength,
        nodes=nodes,
        edges=edges,
    )