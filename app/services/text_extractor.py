from pathlib import Path

from docx import Document as DocxDocument
from pypdf import PdfReader


def extract_pdf_text(file_path: Path) -> str:
    reader = PdfReader(str(file_path))

    pages = []

    for page in reader.pages:
        text = page.extract_text() or ""
        pages.append(text)

    return "\n".join(pages).strip()


def extract_docx_text(file_path: Path) -> str:
    document = DocxDocument(str(file_path))

    paragraphs = []

    for paragraph in document.paragraphs:
        text = paragraph.text.strip()

        if text:
            paragraphs.append(text)

    return "\n".join(paragraphs).strip()


def extract_text(file_path: Path, content_type: str) -> str:
    if content_type == "application/pdf":
        return extract_pdf_text(file_path)

    if (
        content_type
        == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ):
        return extract_docx_text(file_path)

    raise ValueError(f"Unsupported content type: {content_type}")