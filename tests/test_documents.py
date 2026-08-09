from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_upload_pdf(monkeypatch, tmp_path):
    storage_directory = tmp_path / "documents"

    monkeypatch.setattr(
        "app.services.document_storage.STORAGE_DIRECTORY",
        storage_directory,
    )

    file_content = b"fake pdf content"

    response = client.post(
        "/documents/upload",
        files={
            "file": (
                "test.pdf",
                file_content,
                "application/pdf",
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["filename"] == "test.pdf"
    assert data["content_type"] == "application/pdf"
    assert data["size"] == len(file_content)
    assert data["status"] == "uploaded"
    assert "document_id" in data

    stored_file = (
        storage_directory
        / f"{data['document_id']}_test.pdf"
    )

    assert stored_file.exists()
    assert stored_file.read_bytes() == file_content


def test_upload_unsupported_file_type():
    file_content = b"fake image content"

    response = client.post(
        "/documents/upload",
        files={
            "file": (
                "test.jpg",
                file_content,
                "image/jpeg",
            )
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "Unsupported file type. Only PDF and DOCX files are allowed."
    )


def test_upload_empty_file():
    response = client.post(
        "/documents/upload",
        files={
            "file": (
                "empty.pdf",
                b"",
                "application/pdf",
            )
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "The uploaded file is empty."