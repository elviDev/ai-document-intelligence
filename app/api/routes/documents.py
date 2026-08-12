from pathlib import Path
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Document, DocumentChunk
from app.db.session import get_db
from app.schemas.documents import (
    DocumentSearchResult,
    DocumentUploadResponse,
    SemanticSearchResult,
)
from app.services.document_search import (
    search_document_chunks,
    semantic_search_document_chunks,
)
from app.services.document_storage import save_document
from app.services.embedding_service import generate_embedding
from app.services.text_chunker import chunk_text
from app.services.text_extractor import extract_text


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
    db: Session = Depends(get_db),
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

    document_id = uuid4()

    storage_path = save_document(
        document_id=str(document_id),
        filename=file.filename or "unknown",
        content=content,
    )

    extracted_text = extract_text(
        storage_path,
        file.content_type or "",
    )

    document = Document(
        id=document_id,
        filename=file.filename or "unknown",
        content_type=file.content_type or "application/octet-stream",
        size=len(content),
        storage_path=str(storage_path),
        status="uploaded",
        extracted_text=extracted_text,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    chunks = chunk_text(extracted_text)

    for index, chunk in enumerate(chunks):
        embedding = generate_embedding(chunk)

        document_chunk = DocumentChunk(
            document_id=document.id,
            chunk_index=index,
            content=chunk,
            embedding=embedding,
        )

        db.add(document_chunk)

    db.commit()

    return DocumentUploadResponse(
        document_id=str(document.id),
        filename=document.filename,
        content_type=document.content_type,
        size=document.size,
        status=document.status,
    )


@router.get(
    "",
    response_model=list[DocumentUploadResponse],
)
def list_documents(
    db: Session = Depends(get_db),
) -> list[DocumentUploadResponse]:

    documents = db.execute(
        select(Document).order_by(Document.created_at.desc())
    ).scalars().all()

    return [
        DocumentUploadResponse(
            document_id=str(document.id),
            filename=document.filename,
            content_type=document.content_type,
            size=document.size,
            status=document.status,
        )
        for document in documents
    ]


@router.get(
    "/search",
    response_model=list[DocumentSearchResult],
)
def search_documents(
    q: str,
    db: Session = Depends(get_db),
) -> list[DocumentSearchResult]:

    if not q.strip():
        raise HTTPException(
            status_code=400,
            detail="Search query cannot be empty.",
        )

    results = search_document_chunks(
        db=db,
        query=q.strip(),
    )

    return [
        DocumentSearchResult(
            document_id=str(chunk.document_id),
            chunk_index=chunk.chunk_index,
            content=chunk.content,
        )
        for chunk in results
    ]


@router.get(
    "/semantic-search",
    response_model=list[SemanticSearchResult],
)
def semantic_search_documents(
    q: str,
    db: Session = Depends(get_db),
) -> list[SemanticSearchResult]:

    if not q.strip():
        raise HTTPException(
            status_code=400,
            detail="Search query cannot be empty.",
        )

    results = semantic_search_document_chunks(
        db=db,
        query=q.strip(),
    )

    return [
        SemanticSearchResult(
            document_id=str(chunk.document_id),
            chunk_index=chunk.chunk_index,
            content=chunk.content,
            similarity=float(similarity),
        )
        for chunk, similarity in results
    ]


@router.get(
    "/{document_id}",
    response_model=DocumentUploadResponse,
)
def get_document(
    document_id: UUID,
    db: Session = Depends(get_db),
) -> DocumentUploadResponse:

    document = db.get(Document, document_id)

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    return DocumentUploadResponse(
        document_id=str(document.id),
        filename=document.filename,
        content_type=document.content_type,
        size=document.size,
        status=document.status,
    )


@router.delete("/{document_id}")
def delete_document(
    document_id: UUID,
    db: Session = Depends(get_db),
):
    document = db.get(Document, document_id)

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    file_path = Path(document.storage_path)

    if file_path.exists():
        file_path.unlink()

    db.delete(document)
    db.commit()

    return {
        "message": "Document deleted successfully",
        "document_id": str(document_id),
    }