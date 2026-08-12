from openai import OpenAI

from app.core.config import settings


client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_answer(
    question: str,
    context: str,
) -> str:
    response = client.responses.create(
        model="gpt-5-mini",
        instructions=(
            "You are an AI document assistant. "
            "Answer the user's question using only the provided document context. "
            "If the answer cannot be found in the context, say that the information "
            "is not available in the provided documents. "
            "Do not invent facts."
        ),
        input=(
            f"Document context:\n\n{context}\n\n"
            f"User question:\n\n{question}"
        ),
    )

    return response.output_text.strip()