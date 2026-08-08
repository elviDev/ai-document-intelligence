from fastapi import FastAPI

from app.api.routes.health import router as health_router


app = FastAPI(
    title="AI Document Intelligence API",
    description="AI-powered document processing and retrieval platform.",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "message": "AI Document Intelligence API is running",
        "version": "0.1.0",
    }


app.include_router(health_router)