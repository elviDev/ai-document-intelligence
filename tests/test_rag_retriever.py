from unittest.mock import patch
from uuid import uuid4

from app.db.models import DocumentChunk
from app.services.rag_retriever import retrieve_relevant_chunks


def test_retrieve_relevant_chunks():
    fake_chunk = DocumentChunk(
        document_id=uuid4(),
        chunk_index=0,
        content="AI document intelligence uses semantic search.",
    )

    fake_results = [
        (fake_chunk, 0.875),
    ]

    with patch(
        "app.services.rag_retriever.semantic_search_document_chunks",
        return_value=fake_results,
    ):
        results = retrieve_relevant_chunks(
            db=None,
            query="AI document intelligence",
            limit=5,
            min_similarity=0.0,
        )

    assert isinstance(results, list)
    assert results == fake_results


def test_retrieve_relevant_chunks_respects_document_id():
    document_a_id = uuid4()
    document_b_id = uuid4()

    chunk_a = DocumentChunk(
        document_id=document_a_id,
        chunk_index=0,
        content="Python is used for backend development.",
    )

    chunk_b = DocumentChunk(
        document_id=document_b_id,
        chunk_index=0,
        content="Java is used for backend development.",
    )

    fake_results = [
        (chunk_a, 0.92),
        (chunk_b, 0.88),
    ]

    with patch(
        "app.services.rag_retriever.semantic_search_document_chunks",
        return_value=[
            (chunk_a, 0.92),
        ],
    ) as mock_search:
        results = retrieve_relevant_chunks(
            db=None,
            query="What programming language is used?",
            document_id=document_a_id,
            limit=5,
            min_similarity=0.30,
        )

    mock_search.assert_called_once_with(
        db=None,
        query="What programming language is used?",
        document_id=document_a_id,
        limit=5,
    )

    assert results == [
        (chunk_a, 0.92),
    ]

    assert all(
        chunk.document_id == document_a_id
        for chunk, _ in results
    )