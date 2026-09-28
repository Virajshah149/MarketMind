from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.news import News


def get_news(db: Session):
    statement = select(News).order_by(
        News.created_at.desc()
    )

    return list(
        db.scalars(statement).all()
    )


def get_news_item(
    db: Session,
    news_id: int,
):
    statement = select(News).where(
        News.id == news_id
    )

    return db.scalar(statement)


def create_news(
    db: Session,
    data,
):
    news = News(
        title=data.title,
        content=data.content,
        source_name=data.source_name,
        source_url=data.source_url,
        published_at=data.published_at,

        created_by="admin",
        source_type="manual",
    )

    db.add(news)
    db.commit()
    db.refresh(news)

    return news
