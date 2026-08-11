from sentence_transformers import SentenceTransformer


MODEL_NAME = "all-MiniLM-L6-v2"

_model = SentenceTransformer(MODEL_NAME)


def generate_embedding(text: str) -> list[float]:
    """Generate a 384-dimensional embedding for a piece of text."""
    embedding = _model.encode(
        text,
        normalize_embeddings=True,
    )

    return embedding.tolist()