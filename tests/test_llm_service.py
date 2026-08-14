from unittest.mock import MagicMock, patch

from app.services.llm_service import generate_answer


@patch("app.services.llm_service.client")
def test_generate_answer(mock_client):
    mock_response = MagicMock()
    mock_response.output_text = "The contract allows termination with 30 days notice."

    mock_client.responses.create.return_value = mock_response

    answer = generate_answer(
        question="What is the termination period?",
        context="The agreement may be terminated with 30 days written notice.",
    )

    assert answer == "The contract allows termination with 30 days notice."

    mock_client.responses.create.assert_called_once()

@patch("app.services.llm_service.client")
def test_generate_answer_does_not_invent_missing_information(mock_client):
    mock_response = MagicMock()
    mock_response.output_text = (
        "The provided document does not explicitly state who "
        "the Father of Tender Mercies is."
    )

    mock_client.responses.create.return_value = mock_response

    answer = generate_answer(
        question="Who is the Father of Tender Mercies?",
        context=(
            'Public Talk No. 7 – Imitate "The Father of Tender Mercies".\n'
            "Introduction\n"
            "Use the approved Option B introduction."
        ),
    )

    assert (
        answer
        == "The provided document does not explicitly state who "
        "the Father of Tender Mercies is."
    )

    mock_client.responses.create.assert_called_once()