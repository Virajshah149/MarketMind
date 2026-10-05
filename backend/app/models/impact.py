from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Impact(Base):
    __tablename__ = "impacts"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    news_id: Mapped[int] = mapped_column(
        ForeignKey("news.id"),
        nullable=False,
        index=True,
    )

    source_company_id: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True,
    )

    affected_company_id: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True,
    )

    relationship_id: Mapped[int | None] = mapped_column(
        ForeignKey("relationships.id"),
        nullable=True,
        index=True,
    )

    hop: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    impact: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    impact_level: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    shock_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )