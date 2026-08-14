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
            "Answer the user's question using only the supplied document context. "
            "The document context is the only source of truth. "
            "Do not use outside knowledge, even if you know the answer from general knowledge. "
            "Do not invent, assume, or fill in missing information. "
            "If the answer is explicitly stated in the context, answer it directly. "
            "If the context supports an inference, clearly identify it as an inference "
            "and do not present it as something explicitly stated by the document. "
            "If the context does not contain enough information to answer the question, "
            "say that the information is not explicitly stated in the provided document. "
            "Do not pretend that information is present when it is not. "
            "For questions about a specific section, chapter, conclusion, or part of a document, "
            "use the relevant content from the supplied context. "
            "For summaries, summarize only the supplied document context and do not add "
            "information from outside the document. "
            "When appropriate, organize answers with short paragraphs or bullet points. "
            "Keep answers concise but sufficiently detailed to answer the question."
        ),
        input=(
            f"Document context:\n\n{context}\n\n"
            f"User question:\n\n{question}"
        ),
    )

    return response.output_text.strip()