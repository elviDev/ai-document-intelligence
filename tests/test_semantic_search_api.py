from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_semantic_search_endpoint():
    response = client.get(
        "/documents/semantic-search",
        params={"q": "AI document intelligence"},
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) > 0

    first_result = data[0]

    assert "document_id" in first_result
    assert "chunk_index" in first_result
    assert "content" in first_result
    assert "similarity" in first_result

    assert isinstance(first_result["similarity"], float)
    assert 0 <= first_result["similarity"] <= 1