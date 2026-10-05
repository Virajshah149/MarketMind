from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.graph import GraphResponse
from app.services.graph_service import get_graph


router = APIRouter(
    prefix="/graph",
    tags=["Graph"],
)


@router.get(
    "",
    response_model=GraphResponse,
)
def graph(
    db: Session = Depends(get_db),
):
    return get_graph(db)