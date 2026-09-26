from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.event import Event


def get_events(db: Session):
    statement = select(Event).order_by(Event.event_date.desc())

    return list(db.scalars(statement).all())


def get_event(
    db: Session,
    event_id: str,
):
    statement = select(Event).where(
        Event.event_id == event_id
    )

    return db.scalar(statement)


def create_event(
    db: Session,
    data,
):
    event = Event(
        event_id=data.event_id,
        company_id=data.company_id,
        event_type=data.event_type,
        title=data.title,
        description=data.description,
        shock_type=data.shock_type,
        shock_strength=data.shock_strength,
        event_date=data.event_date,
        source_name=data.source_name,
        source_url=data.source_url,
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event