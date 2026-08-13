from openai import OpenAI

from app.core.config import settings


client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_answer(
    question: str,
    context: str,
) -> str:
    response = client.responses.create(
        model="gpt-5-mini",
        instructions = (
            "You are an AI document assistant. "
            "Use only the supplied document context. "
            "Never invent facts or use outside knowledge. "
            "If the user asks for a summary, summarize only the supplied document context. "
            "Do not claim that information exists unless it appears in the context. "
            "When summarizing, organize the answer clearly using the document's actual content."
        ),
        input=(
            f"Document context:\n\n{context}\n\n"
            f"User question:\n\n{question}"
        ),
    )

    return response.output_text.strip()