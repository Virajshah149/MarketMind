from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.evidence import (
    EvidenceCreate,
    EvidenceListResponse,
    EvidenceResponse,
)
from app.services.evidence_service import (
    create_evidence,
    get_evidence,
    get_relationship_evidence,
)


router = APIRouter(
    prefix="/evidence",
    tags=["Evidence"],
)


@router.get(
    "",
    response_model=EvidenceListResponse,
)
def list_evidence(
    db: Session = Depends(get_db),
):
    evidence = get_evidence(db)

    return {
        "data": evidence,
        "total": len(evidence),
    }


@router.post(
    "",
    response_model=EvidenceResponse,
)
def add_evidence(
    data: EvidenceCreate,
    db: Session = Depends(get_db),
):
    return create_evidence(db, data)


@router.get(
    "/relationship/{relationship_id}",
    response_model=EvidenceListResponse,
)
def relationship_evidence(
    relationship_id: int,
    db: Session = Depends(get_db),
):
    evidence = get_relationship_evidence(
        db,
        relationship_id,
    )

    return {
        "data": evidence,
        "total": len(evidence),
    }