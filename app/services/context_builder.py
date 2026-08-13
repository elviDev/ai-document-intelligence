from sqlalchemy.orm import Session

from app.db.models import Document, DocumentChunk


def build_context(
    db: Session,
    results: list[tuple[DocumentChunk, float]],
) -> str:
    """
    Build grounded LLM context from retrieved document chunks.
    """

    if not results:
        return "No relevant document content was found."

    sections = []

    for chunk, similarity in results:
        document = db.get(Document, chunk.document_id)

        filename = (
            document.filename
            if document is not None
            else str(chunk.document_id)
        )

        sections.append(
            "\n".join(
                [
                    f"[Document: {filename}]",
                    f"[Document ID: {chunk.document_id}]",
                    f"[Chunk: {chunk.chunk_index}]",
                    f"[Similarity: {similarity:.4f}]",
                    chunk.content.strip(),
                ]
            )
        )

    return "\n\n---\n\n".join(sections)