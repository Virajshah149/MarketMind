from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.relationship import Relationship


def get_relationships(db: Session):
    statement = select(Relationship).order_by(Relationship.id)
    return list(db.scalars(statement).all())


def get_company_relationships(
    db: Session,
    company_id: str,
):
    statement = select(Relationship).where(
        or_(
            Relationship.source_company_id == company_id,
            Relationship.target_company_id == company_id,
        )
    )

    return list(db.scalars(statement).all())


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