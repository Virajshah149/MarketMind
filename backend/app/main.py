from fastapi import FastAPI

from app.api.v1.router import api_router
from app.core.config import settings


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Corporate dependency and supply-chain intelligence platform",
)

app.include_router(api_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to MarketMind API",
        "status": "running",
        "environment": settings.environment,
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }