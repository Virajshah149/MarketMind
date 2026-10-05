from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.relationship import Relationship


# ============================================================
# GET ALL RELATIONSHIPS
# ============================================================

def get_relationships(db: Session):
    statement = select(Relationship).order_by(
        Relationship.id.asc()
    )

    return list(
        db.scalars(statement).all()
    )


# ============================================================
# GET RELATIONSHIPS FOR ONE COMPANY
# ============================================================

def get_company_relationships(
    db: Session,
    company_id: str,
):
    statement = select(Relationship).where(
        (
            Relationship.source_company_id == company_id
        )
        |
        (
            Relationship.target_company_id == company_id
        )
    ).order_by(
        Relationship.id.asc()
    )

    return list(
        db.scalars(statement).all()
    )


# ============================================================
# CREATE RELATIONSHIP
# ============================================================

def create_relationship(
    db: Session,
    data,
):
    relationship = Relationship(
        source_company_id=data.source_company_id,
        target_company_id=data.target_company_id,
        relationship_type=data.relationship_type,
        strength=data.strength,
        dependency_percentage=data.dependency_percentage,
        commodity=data.commodity,
        evidence_text=data.evidence_text,
        evidence_source=data.evidence_source,
        confidence_score=data.confidence_score,
    )

    db.add(relationship)
    db.commit()
    db.refresh(relationship)

    return relationship


# ============================================================
# NEWS-DRIVEN RELATIONSHIP CHANGE
# ============================================================

def apply_relationship_change(
    db: Session,
    source_company_id: str,
    target_company_id: str,
    relationship_change: str,
    relationship_type: str | None = None,
    change_strength: float = 0.0,
):
    """
    Apply a relationship change caused by a news event.

    Supported:
    - none
    - create
    - strengthen
    - weaken
    - remove
    """

    if relationship_change == "none":
        return None

    if not target_company_id:
        return None

    if source_company_id == target_company_id:
        return None

    # Find existing relationship.
    statement = select(Relationship).where(
        Relationship.source_company_id == source_company_id,
        Relationship.target_company_id == target_company_id,
    )

    relationship = db.scalar(statement)

    # --------------------------------------------------------
    # CREATE
    # --------------------------------------------------------

    if relationship_change == "create":

        if relationship:
            return relationship

        strength = max(
            0.0,
            min(1.0, change_strength),
        )

        relationship = Relationship(
            source_company_id=source_company_id,
            target_company_id=target_company_id,
            relationship_type=(
                relationship_type or "business"
            ),
            strength=strength,
            dependency_percentage=None,
            commodity=None,
            evidence_text=(
                "Relationship identified from news analysis."
            ),
            evidence_source="news_analysis",
            confidence_score=0.5,
        )

        db.add(relationship)
        db.flush()

        return relationship

    # --------------------------------------------------------
    # STRENGTHEN
    # --------------------------------------------------------

    if relationship_change == "strengthen":

        if not relationship:
            return None

        relationship.strength = min(
            1.0,
            relationship.strength + change_strength,
        )

        db.flush()

        return relationship

    # --------------------------------------------------------
    # WEAKEN
    # --------------------------------------------------------

    if relationship_change == "weaken":

        if not relationship:
            return None

        relationship.strength = max(
            0.0,
            relationship.strength - change_strength,
        )

        db.flush()

        return relationship

    # --------------------------------------------------------
    # REMOVE
    # --------------------------------------------------------

    if relationship_change == "remove":

        if not relationship:
            return None

        db.delete(relationship)
        db.flush()

        return None

    raise ValueError(
        f"Unknown relationship change: "
        f"{relationship_change}"
    )