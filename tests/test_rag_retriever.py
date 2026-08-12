from app.db.session import SessionLocal
from app.services.rag_retriever import retrieve_relevant_chunks


def test_retrieve_relevant_chunks():
    db = SessionLocal()

    try:
        results = retrieve_relevant_chunks(
            db=db,
            query="AI document intelligence",
            limit=5,
            min_similarity=0.0,
        )

        assert isinstance(results, list)

        for chunk, similarity in results:
            assert chunk.content
            assert isinstance(similarity, float)
            assert 0.0 <= similarity <= 1.0

    finally:
        db.close()