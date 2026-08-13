from io import BytesIO

from fastapi.testclient import TestClient
from reportlab.pdfgen import canvas
from sqlalchemy import select

from app.db.models import Document, DocumentChunk
from app.db.session import SessionLocal
from app.main import app


client = TestClient(app)


def create_test_pdf() -> bytes:
    buffer = BytesIO()

    pdf = canvas.Canvas(buffer)
    pdf.drawString(100, 750, "AI Document Intelligence Test PDF")
    pdf.drawString(100, 730, "This document is used for automated testing.")
    pdf.save()

    return buffer.getvalue()


def test_upload_pdf(monkeypatch, tmp_path):
    storage_directory = tmp_path / "documents"

    monkeypatch.setattr(
        "app.services.document_storage.STORAGE_DIRECTORY",
        storage_directory,
    )

    file_content = create_test_pdf()

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
        storage_directory / f"{data['document_id']}_test.pdf"
    )

    assert stored_file.exists()
    assert stored_file.read_bytes() == file_content

    db = SessionLocal()

    try:
        document = db.execute(
            select(Document).where(
                Document.id == data["document_id"]
            )
        ).scalar_one()

        assert document.extracted_text
        assert "AI Document Intelligence Test PDF" in document.extracted_text
    finally:
        db.close()


def test_upload_pdf_creates_chunks(monkeypatch, tmp_path):
    storage_directory = tmp_path / "documents"

    monkeypatch.setattr(
        "app.services.document_storage.STORAGE_DIRECTORY",
        storage_directory,
    )

    file_content = create_test_pdf()

    response = client.post(
        "/documents/upload",
        files={
            "file": (
                "chunk-test.pdf",
                file_content,
                "application/pdf",
            )
        },
    )

    assert response.status_code == 200

    data = response.json()
    document_id = data["document_id"]

    db = SessionLocal()

    try:
        chunks = db.execute(
            select(DocumentChunk)
            .where(
                DocumentChunk.document_id == document_id
            )
            .order_by(DocumentChunk.chunk_index)
        ).scalars().all()

        assert len(chunks) > 0
        assert chunks[0].chunk_index == 0
        assert "AI Document Intelligence Test PDF" in chunks[0].content

    finally:
        db.close()


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

def test_upload_document_with_no_extractable_text(
    monkeypatch,
    tmp_path,
):
    storage_directory = tmp_path / "documents"

    monkeypatch.setattr(
        "app.services.document_storage.STORAGE_DIRECTORY",
        storage_directory,
    )

    monkeypatch.setattr(
        "app.api.routes.documents.extract_text",
        lambda file_path, content_type: "",
    )

    file_content = b"fake pdf bytes"

    response = client.post(
        "/documents/upload",
        files={
            "file": (
                "scanned.pdf",
                file_content,
                "application/pdf",
            )
        },
    )

    assert response.status_code == 400

    assert response.json()["detail"] == (
        "No readable text could be extracted from the document. "
        "Scanned or image-only documents are not currently supported."
    )

    stored_file = list(storage_directory.glob("*"))

    assert stored_file == []

    db = SessionLocal()

    try:
        document = db.execute(
            select(Document).where(
                Document.filename == "scanned.pdf"
            )
        ).scalar_one_or_none()

        assert document is None

    finally:
        db.close()