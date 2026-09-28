import csv
from pathlib import Path

from sqlalchemy import select

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.company import Company


CSV_PATH = (
    Path(__file__).resolve().parents[3]
    / "data"
    / "companies.csv"
)


def seed_companies():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        with CSV_PATH.open(
            "r",
            encoding="utf-8",
            newline="",
        ) as file:
            reader = csv.DictReader(file)

            inserted = 0
            updated = 0

            for row in reader:
                company = db.scalar(
                    select(Company).where(
                        Company.company_id == row["company_id"]
                    )
                )

                if company is None:
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
                    inserted += 1

                else:
                    company.company_name = row["company_name"]
                    company.legal_name = row["legal_name"]
                    company.ticker = row["ticker"]
                    company.exchange = row["exchange"]
                    company.sector = row["sector"]
                    company.industry = row["industry"]

                    updated += 1

            db.commit()

            print(f"Companies inserted: {inserted}")
            print(f"Companies updated: {updated}")
            print("Company import completed.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_companies()