from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_upload_pdf():
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