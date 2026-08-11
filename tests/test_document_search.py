from uuid import uuid4

from sqlalchemy import select

from app.db.models import Document, DocumentChunk
from app.db.session import SessionLocal
from app.services.document_search import search_document_chunks


def test_search_document_chunks():
    document_id = uuid4()

    db = SessionLocal()

    try:
        document = Document(
            id=document_id,
            filename="search-test.pdf",
            content_type="application/pdf",
            size=100,
            storage_path="test/search-test.pdf",
            status="uploaded",
            extracted_text="Python and FastAPI are used for backend development.",
        )

        db.add(document)

        chunks = [
            DocumentChunk(
                document_id=document_id,
                chunk_index=0,
                content="Python and FastAPI are used for backend development.",
            ),
            DocumentChunk(
                document_id=document_id,
                chunk_index=1,
                content="PostgreSQL stores the document metadata.",
            ),
            DocumentChunk(
                document_id=document_id,
                chunk_index=2,
                content="Artificial intelligence can analyze documents.",
            ),
        ]

        db.add_all(chunks)
        db.commit()

        results = search_document_chunks(
            db=db,
            query="Python",
        )

        assert len(results) == 1
        assert "Python" in results[0].content

    finally:
        db.execute(
            select(DocumentChunk).where(
                DocumentChunk.document_id == document_id
            )
        )
        db.query(DocumentChunk).filter(
            DocumentChunk.document_id == document_id
        ).delete()

        db.query(Document).filter(
            Document.id == document_id
        ).delete()

        db.commit()
        db.close()