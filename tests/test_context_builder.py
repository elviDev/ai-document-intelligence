from uuid import uuid4

from app.db.models import Document, DocumentChunk
from app.db.session import SessionLocal
from app.services.context_builder import build_context


def test_build_context():
    document_id = uuid4()

    db = SessionLocal()

    try:
        document = Document(
            id=document_id,
            filename="context-test.pdf",
            content_type="application/pdf",
            size=100,
            storage_path="test/context-test.pdf",
            status="uploaded",
            extracted_text="AI document intelligence uses semantic search.",
        )

        db.add(document)
        db.commit()

        chunk = DocumentChunk(
            document_id=document_id,
            chunk_index=0,
            content="AI document intelligence uses semantic search.",
        )

        context = build_context(
            db=db,
            results=[
                (chunk, 0.875),
            ],
        )

        assert "context-test.pdf" in context
        assert "AI document intelligence uses semantic search." in context
        assert "[Chunk: 0]" in context
        assert "[Similarity: 0.8750]" in context

    finally:
        db.close()


def test_build_context_with_no_results():
    db = SessionLocal()

    try:
        context = build_context(
            db=db,
            results=[],
        )

        assert context == "No relevant document content was found."

    finally:
        db.close()