from pathlib import Path


STORAGE_DIRECTORY = Path("storage/documents")


def save_document(document_id: str, filename: str, content: bytes) -> Path:
    STORAGE_DIRECTORY.mkdir(parents=True, exist_ok=True)

    file_path = STORAGE_DIRECTORY / f"{document_id}_{filename}"

    file_path.write_bytes(content)

    return file_path