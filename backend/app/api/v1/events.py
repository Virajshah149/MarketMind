from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.event import (
    EventCreate,
    EventListResponse,
    EventResponse,
)
from app.services.event_service import (
    create_event,
    get_event,
    get_events,
)


router = APIRouter(
    prefix="/events",
    tags=["Events"],
)


@router.get(
    "",
    response_model=EventListResponse,
)
def list_events(
    db: Session = Depends(get_db),
):
    events = get_events(db)

    return {
        "data": events,
        "total": len(events),
    }


@router.post(
    "",
    response_model=EventResponse,
)
def add_event(
    data: EventCreate,
    db: Session = Depends(get_db),
):
    return create_event(db, data)


@router.get(
    "/{event_id}",
    response_model=EventResponse,
)
def event_details(
    event_id: str,
    db: Session = Depends(get_db),
):
    event = get_event(db, event_id)

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Event not found",
        )

    return event