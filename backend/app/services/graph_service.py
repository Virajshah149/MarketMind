from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.relationship import Relationship


def get_graph(db: Session):

    companies = list(
        db.scalars(
            select(Company).order_by(Company.company_name)
        ).all()
    )

    relationships = list(
        db.scalars(
            select(Relationship).order_by(Relationship.id)
        ).all()
    )

    nodes = [
        {
            "company_id": company.company_id,
            "company_name": company.company_name,
            "ticker": company.ticker,
            "sector": company.sector,
            "industry": company.industry,
        }
        for company in companies
    ]

    edges = [
        {
            "source": relationship.source_company_id,
            "target": relationship.target_company_id,
            "relationship_type": relationship.relationship_type,
            "strength": relationship.strength,
            "dependency_percentage": relationship.dependency_percentage,
            "commodity": relationship.commodity,
        }
        for relationship in relationships
    ]

    return {
        "nodes": nodes,
        "edges": edges,
    }