from pydantic import BaseModel


class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    content_type: str
    size: int
    status: str


class DocumentSearchResult(BaseModel):
    document_id: str
    chunk_index: int
    content: str


class SemanticSearchResult(BaseModel):
    document_id: str
    chunk_index: int
    content: str
    similarity: float

class DocumentAskRequest(BaseModel):
    question: str
    document_id: str | None = None


class DocumentAskResponse(BaseModel):
    answer: str
    sources: list[SemanticSearchResult]
    

class DocumentDetailResponse(BaseModel):
    document_id: str
    filename: str
    content_type: str
    size: int
    status: str
    extracted_text: str