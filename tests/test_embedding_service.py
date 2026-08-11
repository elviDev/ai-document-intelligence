from app.services.embedding_service import generate_embedding


def test_generate_embedding():
    text = "AI document intelligence"

    embedding = generate_embedding(text)

    assert isinstance(embedding, list)
    assert len(embedding) == 384
    assert all(isinstance(value, float) for value in embedding)