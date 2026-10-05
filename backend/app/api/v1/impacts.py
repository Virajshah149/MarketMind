from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.impact import (
    ImpactListResponse,
)
from app.services.impact_service import (
    get_news_impacts,
)


router = APIRouter(
    prefix="/impacts",
    tags=["Impacts"],
)


@router.get(
    "/news/{news_id}",
    response_model=ImpactListResponse,
)
def news_impacts(
    news_id: int,
    db: Session = Depends(get_db),
):

    impacts = get_news_impacts(
        db,
        news_id,
    )

    return {
        "data": impacts,
        "total": len(impacts),
    }