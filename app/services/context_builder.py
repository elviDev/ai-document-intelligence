from app.db.models import DocumentChunk


def build_context(
    results: list[tuple[DocumentChunk, float]],
) -> str:
    """
    Build a text context from retrieved document chunks.

    Each chunk is included with its document ID, chunk index,
    and similarity score so the eventual LLM can use the
    retrieved content while preserving source information.
    """
    if not results:
        return "No relevant document content was found."

    sections = []

    for chunk, similarity in results:
        sections.append(
            "\n".join(
                [
                    f"[Document: {chunk.document_id}]",
                    f"[Chunk: {chunk.chunk_index}]",
                    f"[Similarity: {similarity:.4f}]",
                    chunk.content.strip(),
                ]
            )
        )

    return "\n\n---\n\n".join(sections)