def chunk_text(
    text: str,
    chunk_size: int = 1000,
    overlap: int = 200,
) -> list[str]:
    """
    Split text into overlapping chunks.

    Args:
        text: The text to split.
        chunk_size: Maximum number of characters per chunk.
        overlap: Number of characters shared between consecutive chunks.

    Returns:
        A list of text chunks.
    """

    if not text or not text.strip():
        return []

    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than 0")

    if overlap < 0:
        raise ValueError("overlap cannot be negative")

    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    cleaned_text = text.strip()

    chunks = []
    start = 0

    while start < len(cleaned_text):
        end = start + chunk_size

        chunk = cleaned_text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end >= len(cleaned_text):
            break

        start = end - overlap

    return chunks