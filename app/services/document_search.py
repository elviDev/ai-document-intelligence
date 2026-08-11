from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import DocumentChunk


def search_document_chunks(
    db: Session,
    query: str,
    document_id=None,
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