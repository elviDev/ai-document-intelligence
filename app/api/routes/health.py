from fastapi import APIRouter

from app.schemas.health import HealthResponse


router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="healthy",
        service="AI Document Intelligence API",
        version="0.1.0",
    )