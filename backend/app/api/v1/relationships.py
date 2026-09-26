from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.relationship import (
    RelationshipCreate,
    RelationshipListResponse,
    RelationshipResponse,
)
from app.services.relationship_service import (
    create_relationship,
    get_company_relationships,
    get_relationships,
)


router = APIRouter(
    prefix="/relationships",
    tags=["Relationships"],
)


@router.get(
    "",
    response_model=RelationshipListResponse,
)
def list_relationships(
    db: Session = Depends(get_db),
):
    relationships = get_relationships(db)

    return {
        "data": relationships,
        "total": len(relationships),
    }


@router.post(
    "",
    response_model=RelationshipResponse,
)
def add_relationship(
    data: RelationshipCreate,
    db: Session = Depends(get_db),
):
    return create_relationship(db, data)


@router.get(
    "/company/{company_id}",
    response_model=RelationshipListResponse,
)
def company_relationships(
    company_id: str,
    db: Session = Depends(get_db),
):
    relationships = get_company_relationships(
        db,
        company_id,
    )

    return {
        "data": relationships,
        "total": len(relationships),
    }