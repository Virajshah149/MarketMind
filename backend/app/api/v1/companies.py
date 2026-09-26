from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.company import (
    CompanyListResponse,
    CompanyResponse,
)
from app.services.company_service import (
    get_companies,
    get_company,
)


router = APIRouter(
    prefix="/companies",
    tags=["Companies"],
)


@router.get("", response_model=CompanyListResponse)
def list_companies(
    db: Session = Depends(get_db),
):
    companies = get_companies(db)

    return {
        "data": companies,
        "total": len(companies),
    }


@router.get(
    "/{company_id}",
    response_model=CompanyResponse,
)
def company_details(
    company_id: str,
    db: Session = Depends(get_db),
):
    company = get_company(db, company_id)

    if company is None:
        raise HTTPException(
            status_code=404,
            detail="Company not found",
        )

    return company