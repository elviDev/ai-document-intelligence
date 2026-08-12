from uuid import uuid4

from app.db.models import DocumentChunk
from app.services.context_builder import build_context


def test_build_context():
    document_id = uuid4()

    chunk = DocumentChunk(
        document_id=document_id,
        chunk_index=0,
        content="AI document intelligence uses semantic search.",
    )

    context = build_context(
        [
            (chunk, 0.875),
        ]
    )

    assert f"[Document: {document_id}]" in context
    assert "[Chunk: 0]" in context
    assert "[Similarity: 0.8750]" in context
    assert "AI document intelligence uses semantic search." in context


def test_build_context_with_no_results():
    context = build_context([])

    assert context == "No relevant document content was found."