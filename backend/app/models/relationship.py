from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Relationship(Base):
    __tablename__ = "relationships"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    source_company_id: Mapped[str] = mapped_column(
        ForeignKey("companies.company_id"),
        nullable=False,
        index=True,
    )

    target_company_id: Mapped[str] = mapped_column(
        ForeignKey("companies.company_id"),
        nullable=False,
        index=True,
    )

    relationship_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    strength: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    dependency_percentage: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    commodity: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    evidence_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    evidence_source: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    confidence_score: Mapped[float] = mapped_column(
        Float,
        default=0.5,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )