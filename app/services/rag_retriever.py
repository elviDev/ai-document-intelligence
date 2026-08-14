from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models import DocumentChunk
from app.services.document_search import semantic_search_document_chunks


def retrieve_relevant_chunks(
    db: Session,
    query: str,
    document_id: UUID | None = None,
    limit: int = 5,
    min_similarity: float = 0.30,
) -> list[tuple[DocumentChunk, float]]:
    results = semantic_search_document_chunks(
        db=db,
        query=query,
        document_id=document_id,
        limit=limit,
    )

    filtered_results = [
        (chunk, similarity)
        for chunk, similarity in results
        if similarity >= min_similarity
    ]

    if filtered_results:
        return filtered_results

    # When a specific document is selected, fall back to the
    # best available chunk from that document instead of claiming
    # that no information exists.
    if document_id is not None and results:
        return [results[0]]

    return []


def retrieve_document_chunks(
    db: Session,
    document_id: UUID,
) -> list[tuple[DocumentChunk, float]]:
    results = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.document_id == document_id)
        .order_by(DocumentChunk.chunk_index.asc())
        .all()
    )

    return [
        (chunk, 1.0)
        for chunk in results
    ]