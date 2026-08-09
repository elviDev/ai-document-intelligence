from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas.documents import DocumentUploadResponse
from app.services.document_storage import save_document


router = APIRouter(
    prefix="/documents",
    tags=["documents"],
)


ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
)
async def upload_document(
    file: UploadFile = File(...),
) -> DocumentUploadResponse:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Only PDF and DOCX files are allowed.",
        )

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    document_id = str(uuid4())

    save_document(
        document_id=document_id,
        filename=file.filename or "unknown",
        content=content,
    )

    return DocumentUploadResponse(
        document_id=document_id,
        filename=file.filename or "unknown",
        content_type=file.content_type or "application/octet-stream",
        size=len(content),
        status="uploaded",
    )