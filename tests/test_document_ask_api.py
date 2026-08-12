from unittest.mock import patch
from uuid import uuid4

from fastapi.testclient import TestClient

from app.db.models import DocumentChunk
from app.main import app


client = TestClient(app)


@patch("app.api.routes.documents.generate_answer")
@patch("app.api.routes.documents.retrieve_relevant_chunks")
def test_ask_documents_no_relevant_results(
    mock_retrieve,
    mock_generate_answer,
):
    mock_retrieve.return_value = []

    response = client.post(
        "/documents/ask",
        json={
            "question": "What is the termination period?"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["answer"] == (
        "I could not find relevant information in the provided documents."
    )
    assert data["sources"] == []

    mock_retrieve.assert_called_once()
    mock_generate_answer.assert_not_called()


@patch("app.api.routes.documents.generate_answer")
@patch("app.api.routes.documents.retrieve_relevant_chunks")
def test_ask_documents_with_relevant_results(
    mock_retrieve,
    mock_generate_answer,
):
    document_id = uuid4()

    chunk = DocumentChunk(
        document_id=document_id,
        chunk_index=2,
        content="The contract may be terminated with 30 days written notice.",
    )

    mock_retrieve.return_value = [
        (chunk, 0.91),
    ]

    mock_generate_answer.return_value = (
        "The contract may be terminated with 30 days written notice."
    )

    response = client.post(
        "/documents/ask",
        json={
            "question": "What is the termination period?"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["answer"] == (
        "The contract may be terminated with 30 days written notice."
    )

    assert len(data["sources"]) == 1

    source = data["sources"][0]

    assert source["document_id"] == str(document_id)
    assert source["chunk_index"] == 2
    assert source["content"] == (
        "The contract may be terminated with 30 days written notice."
    )
    assert source["similarity"] == 0.91

    mock_retrieve.assert_called_once()
    mock_generate_answer.assert_called_once()