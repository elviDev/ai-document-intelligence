from pathlib import Path

from app.services.text_extractor import extract_text


PDF_PATH = Path(
    "storage/documents/"
    "d77da66c-9c00-451d-9b7a-85f26605740f_00-Formulario_estancia.pdf"
)

DOCX_PATH = Path("storage/documents/extraction_test.docx")


def test_extract_pdf_text():
    text = extract_text(PDF_PATH, "application/pdf")

    assert text
    assert len(text) > 100


def test_extract_docx_text():
    content_type = (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

    text = extract_text(DOCX_PATH, content_type)

    assert text
    assert len(text) > 100
    assert "AI Document Intelligence Test" in text


def test_unsupported_content_type():
    try:
        extract_text(Path("dummy.txt"), "text/plain")
        assert False, "Expected ValueError"
    except ValueError as exc:
        assert "Unsupported content type" in str(exc)