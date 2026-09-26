from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.evidence import Evidence


def get_evidence(db: Session):
    statement = select(Evidence).order_by(Evidence.id)

    return list(db.scalars(statement).all())


def get_relationship_evidence(
    db: Session,
    relationship_id: int,
):
    statement = select(Evidence).where(
        Evidence.relationship_id == relationship_id
    ).order_by(Evidence.id)

    return list(db.scalars(statement).all())


def create_evidence(
    db: Session,
    data,
):
    evidence = Evidence(
        relationship_id=data.relationship_id,
        evidence_type=data.evidence_type,
        title=data.title,
        evidence_text=data.evidence_text,
        source_name=data.source_name,
        source_url=data.source_url,
        published_date=data.published_date,
        verification_status=data.verification_status,
    )

    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    return evidence