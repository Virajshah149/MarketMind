import csv
from pathlib import Path

from sqlalchemy import select

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.company import Company
from app.models.relationship import Relationship
from app.models.evidence import Evidence
from app.models.event import Event
from app.models.news import News
from app.models.impact import Impact

def seed_companies():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        csv_path = (
            Path(__file__).resolve().parents[3]
            / "data"
            / "companies.csv"
        )

        with csv_path.open(
            "r",
            encoding="utf-8",
            newline="",
        ) as file:
            reader = csv.DictReader(file)

            for row in reader:
                existing = db.scalar(
                    select(Company).where(
                        Company.company_id == row["company_id"]
                    )
                )

                if existing:
                    continue

                company = Company(
                    company_id=row["company_id"],
                    company_name=row["company_name"],
                    legal_name=row["legal_name"],
                    ticker=row["ticker"],
                    exchange=row["exchange"],
                    sector=row["sector"],
                    industry=row["industry"],
                )

                db.add(company)

        db.commit()

        print("Company seed completed.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_companies()