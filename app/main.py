from fastapi import FastAPI

from app.api.routes.documents import router as documents_router
from app.api.routes.health import router as health_router
from app.schemas.health import HealthResponse


app = FastAPI(
    title="AI Document Intelligence API",
    description="AI-powered document processing and retrieval platform.",
    version="0.1.0",
)


app.include_router(health_router)
app.include_router(documents_router)


@app.get("/", tags=["default"])
def root():
    return {
        "message": "AI Document Intelligence API is running",
        "version": "0.1.0",
    }