import pytest

from app.services.text_chunker import chunk_text


def test_chunk_text_splits_long_text():
    text = "A" * 2500

    chunks = chunk_text(
        text,
        chunk_size=1000,
        overlap=200,
    )

    assert len(chunks) == 3
    assert len(chunks[0]) == 1000
    assert len(chunks[1]) == 1000
    assert len(chunks[2]) == 900


def test_chunk_text_preserves_overlap():
    text = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    chunks = chunk_text(
        text,
        chunk_size=10,
        overlap=2,
    )

    assert chunks[0] == "ABCDEFGHIJ"
    assert chunks[1] == "IJKLMNOPQR"


def test_chunk_text_empty_text():
    assert chunk_text("") == []
    assert chunk_text("   ") == []


def test_chunk_text_short_text():
    text = "Short document."

    chunks = chunk_text(
        text,
        chunk_size=1000,
        overlap=200,
    )

    assert chunks == [text]


def test_chunk_text_invalid_chunk_size():
    with pytest.raises(ValueError):
        chunk_text("Hello", chunk_size=0)


def test_chunk_text_invalid_overlap():
    with pytest.raises(ValueError):
        chunk_text("Hello", chunk_size=10, overlap=10)


def test_chunk_text_negative_overlap():
    with pytest.raises(ValueError):
        chunk_text("Hello", chunk_size=10, overlap=-1)