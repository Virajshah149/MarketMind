import csv
from pathlib import Path

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.evidence import Evidence
from app.models.relationship import Relationship


CSV_PATH = (
    Path(__file__).resolve().parents[3]
    / "data"
    / "evidence.csv"
)


def import_evidence():
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
                relationship_key = row["relationship_key"]

                source_id, target_id, relationship_type = (
                    relationship_key.split("-")
                )

                relationship = db.scalar(
                    select(Relationship).where(
                        Relationship.source_company_id == source_id,
                        Relationship.target_company_id == target_id,
                        Relationship.relationship_type
                        == relationship_type,
                    )
                )

                if relationship is None:
                    raise ValueError(
                        f"Relationship not found: {relationship_key}"
                    )

                evidence = db.scalar(
                    select(Evidence).where(
                        Evidence.relationship_id == relationship.id,
                        Evidence.source_name == row["source_name"],
                        Evidence.title == row["document_title"],
                    )
                )

                if evidence is None:
                    evidence = Evidence(
                        relationship_id=relationship.id,
                        evidence_type=row["evidence_type"],
                        title=row["document_title"],
                        evidence_text=row["evidence_text"],
                        source_name=row["source_name"],
                        source_url=row["source_url"],
                        verification_status=row[
                            "verification_status"
                        ],
                    )

                    db.add(evidence)
                    inserted += 1

                else:
                    evidence.evidence_type = row["evidence_type"]
                    evidence.title = row["document_title"]
                    evidence.evidence_text = row["evidence_text"]
                    evidence.source_name = row["source_name"]
                    evidence.source_url = row["source_url"]
                    evidence.verification_status = row[
                        "verification_status"
                    ]

                    updated += 1

        db.commit()

        print(f"Evidence inserted: {inserted}")
        print(f"Evidence updated: {updated}")
        print("Evidence import completed.")

    finally:
        db.close()


if __name__ == "__main__":
    import_evidence()