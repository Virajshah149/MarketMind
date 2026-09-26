from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.simulation import (
    SimulationRequest,
    SimulationResponse,
)
from app.services.simulation_service import (
    simulate_shock,
)


router = APIRouter(
    prefix="/simulations",
    tags=["Simulations"],
)


@router.post(
    "",
    response_model=SimulationResponse,
)
def run_simulation(
    request: SimulationRequest,
    db: Session = Depends(get_db),
):
    try:

        return simulate_shock(
            db=db,
            source_company_id=request.source_company_id,
            shock_type=request.shock_type,
            shock_strength=request.shock_strength,
            max_hops=request.max_hops,
            minimum_impact=request.minimum_impact,
            hop_decay=request.hop_decay,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error),
        )