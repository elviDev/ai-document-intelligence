from pathlib import Path

from app.services.document_storage import save_document


def test_save_document(tmp_path, monkeypatch):
    storage_directory = tmp_path / "documents"

    monkeypatch.setattr(
        "app.services.document_storage.STORAGE_DIRECTORY",
        storage_directory,
    )

    document_id = "test-document-id"
    filename = "test.pdf"
    content = b"test document content"

    file_path = save_document(
        document_id=document_id,
        filename=filename,
        content=content,
    )

    assert file_path.exists()
    assert file_path.read_bytes() == content
    assert file_path.name == "test-document-id_test.pdf"