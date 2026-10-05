import csv
from pathlib import Path

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.company import Company
from app.models.relationship import Relationship


CSV_PATH = (
    Path(__file__).resolve().parents[3]
    / "data"
    / "relationships.csv"
)


def import_relationships():
    db = SessionLocal()

    try:
        inserted = 0
        updated = 0

        with CSV_PATH.open(
            "r",
            encoding="utf-8",
            newline="",
        ) as file:
            reader = csv.DictReader(file)

            for row in reader:
                source_company = db.scalar(
                    select(Company).where(
                        Company.company_id == row["source_company_id"]
                    )
                )

                target_company = db.scalar(
                    select(Company).where(
                        Company.company_id == row["target_company_id"]
                    )
                )

                if source_company is None:
                    raise ValueError(
                        f"Source company not found: "
                        f"{row['source_company_id']}"
                    )

                if target_company is None:
                    raise ValueError(
                        f"Target company not found: "
                        f"{row['target_company_id']}"
                    )

                relationship = db.scalar(
                    select(Relationship).where(
                        Relationship.source_company_id
                        == row["source_company_id"],
                        Relationship.target_company_id
                        == row["target_company_id"],
                        Relationship.relationship_type
                        == row["relationship_type"],
                    )
                )

                dependency_percentage = (
                    float(row["dependency_percentage"])
                    if row["dependency_percentage"]
                    else None
                )

                if relationship is None:
                    relationship = Relationship(
                        source_company_id=row["source_company_id"],
                        target_company_id=row["target_company_id"],
                        relationship_type=row["relationship_type"],
                        strength=float(row["strength"]),
                        dependency_percentage=dependency_percentage,
                        commodity=row["commodity"] or None,
                        evidence_text=row["evidence_text"] or None,
                        evidence_source=row["evidence_source"] or None,
                        confidence_score=float(
                            row["confidence_score"]
                        ),
                    )

                    db.add(relationship)
                    inserted += 1

                else:
                    relationship.strength = float(row["strength"])
                    relationship.dependency_percentage = (
                        dependency_percentage
                    )
                    relationship.commodity = (
                        row["commodity"] or None
                    )
                    relationship.evidence_text = (
                        row["evidence_text"] or None
                    )
                    relationship.evidence_source = (
                        row["evidence_source"] or None
                    )
                    relationship.confidence_score = float(
                        row["confidence_score"]
                    )

                    updated += 1

        db.commit()

        print(f"Relationships inserted: {inserted}")
        print(f"Relationships updated: {updated}")
        print("Relationship import completed.")

    finally:
        db.close()


if __name__ == "__main__":
    import_relationships()