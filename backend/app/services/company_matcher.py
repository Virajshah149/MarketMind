import re

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.company import Company


def normalize_text(text: str) -> str:
    text = text.lower()

    text = re.sub(
        r"[^a-z0-9\s]",
        " ",
        text,
    )

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


def find_company_mentions(
    db: Session,
    title: str,
    content: str | None = None,
):
    companies = list(
        db.scalars(
            select(Company)
        ).all()
    )

    text = normalize_text(
        f"{title} {content or ''}"
    )

    matches = []

    for company in companies:

        company_name = normalize_text(
            company.company_name
        )

        legal_name = normalize_text(
            company.legal_name
        )

        names = {
            company_name,
            legal_name,
        }

        for name in names:

            if not name:
                continue

            if name in text:

                matches.append(
                    {
                        "company_id": company.company_id,
                        "company_name": company.company_name,
                    }
                )

                break

    return matches