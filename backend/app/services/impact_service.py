from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.impact import Impact


def get_news_impacts(
    db: Session,
    news_id: int,
):
    statement = (
        select(Impact)
        .where(Impact.news_id == news_id)
        .order_by(
            Impact.hop,
            Impact.impact.desc(),
        )
    )

    return list(
        db.scalars(statement).all()
    )


def save_impacts(
    db: Session,
    news_id: int,
    source_company_id: str,
    shock_type: str,
    nodes: list[dict],
    edges: list[dict],
):
    """
    Store the simulation results for one news event.
    """

    # Remove previous results if the same news
    # is simulated again.
    existing = db.scalars(
        select(Impact).where(
            Impact.news_id == news_id
        )
    ).all()

    for impact in existing:
        db.delete(impact)

    db.flush()

    # Map each target company to the relationship
    # used to reach it.
    edge_map = {
        edge["target_company_id"]: edge
        for edge in edges
    }

    created_impacts = []

    for node in nodes:

        # The source company itself is not an
        # affected-company impact.
        if node["hop"] == 0:
            continue

        edge = edge_map.get(
            node["company_id"]
        )

        impact = Impact(
            news_id=news_id,
            source_company_id=source_company_id,
            affected_company_id=node["company_id"],
            relationship_id=(
                edge.get("relationship_id")
                if edge
                else None
            ),
            hop=node["hop"],
            impact=node["impact"],
            impact_level=node["impact_level"],
            shock_type=shock_type,
        )

        db.add(impact)
        created_impacts.append(impact)

    db.commit()

    for impact in created_impacts:
        db.refresh(impact)

    return created_impacts