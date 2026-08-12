from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import DocumentChunk
from app.services.embedding_service import generate_embedding


def search_document_chunks(
    db: Session,
    query: str,
    document_id: UUID | None = None,
    limit: int = 5,
) -> list[DocumentChunk]:
    statement = select(DocumentChunk).where(
        DocumentChunk.content.ilike(f"%{query}%")
    )

    if document_id is not None:
        statement = statement.where(
            DocumentChunk.document_id == document_id
        )

    statement = statement.limit(limit)

    return db.execute(statement).scalars().all()


def semantic_search_document_chunks(
    db: Session,
    query: str,
    document_id: UUID | None = None,
    limit: int = 5,
) -> list[tuple[DocumentChunk, float]]:
    query_embedding = generate_embedding(query)

    distance = DocumentChunk.embedding.cosine_distance(query_embedding)

    statement = select(
        DocumentChunk,
        (1 - distance).label("similarity"),
    ).where(
        DocumentChunk.embedding.is_not(None)
    )

    if document_id is not None:
        statement = statement.where(
            DocumentChunk.document_id == document_id
        )

    statement = (
        statement
        .order_by(distance)
        .limit(limit)
    )

    return db.execute(statement).all()