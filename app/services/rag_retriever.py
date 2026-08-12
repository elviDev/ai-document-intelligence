from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models import DocumentChunk
from app.services.document_search import semantic_search_document_chunks


DEFAULT_LIMIT = 5
DEFAULT_MIN_SIMILARITY = 0.30


def retrieve_relevant_chunks(
    db: Session,
    query: str,
    document_id: UUID | None = None,
    limit: int = DEFAULT_LIMIT,
    min_similarity: float = DEFAULT_MIN_SIMILARITY,
) -> list[tuple[DocumentChunk, float]]:
    results = semantic_search_document_chunks(
        db=db,
        query=query,
        document_id=document_id,
        limit=limit,
    )

    return [
        (chunk, similarity)
        for chunk, similarity in results
        if similarity >= min_similarity
    ]