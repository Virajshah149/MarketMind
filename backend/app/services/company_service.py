from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.company import Company


def get_companies(db: Session) -> list[Company]:
    statement = select(Company).order_by(Company.company_name)
    return list(db.scalars(statement).all())


def get_company(
    db: Session,
    company_id: str,
) -> Company | None:
    statement = select(Company).where(
        Company.company_id == company_id
    )

    return db.scalar(statement)