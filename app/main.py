from fastapi import FastAPI

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