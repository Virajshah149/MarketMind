from fastapi import APIRouter

from app.api.v1.companies import router as companies_router
from app.api.v1.relationships import router as relationships_router
from app.api.v1.simulation import router as simulation_router
from app.api.v1.evidence import router as evidence_router
from app.api.v1.events import router as events_router
from app.api.v1.graph import router as graph_router
from app.api.v1.news import router as news_router
from app.api.v1.impacts import router as impacts_router

api_router = APIRouter(prefix="/api/v1")


api_router.include_router(companies_router)
api_router.include_router(relationships_router)
api_router.include_router(simulation_router)
api_router.include_router(evidence_router)
api_router.include_router(events_router)
api_router.include_router(graph_router)
api_router.include_router(news_router)
api_router.include_router(impacts_router)