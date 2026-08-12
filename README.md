# AI Document Intelligence API

AI-powered document processing and retrieval API built with FastAPI, PostgreSQL, pgvector, Sentence Transformers, and OpenAI.

The platform accepts PDF and DOCX documents, extracts their text, splits the content into chunks, generates semantic embeddings, stores vectors in PostgreSQL, performs semantic retrieval, and uses Retrieval-Augmented Generation (RAG) to answer questions using relevant document content.

## Features

- PDF and DOCX document upload
- Text extraction with `pypdf` and `python-docx`
- Configurable text chunking with overlap
- 384-dimensional semantic embeddings
- PostgreSQL with `pgvector`
- Keyword document search
- Vector-based semantic search
- Similarity scoring
- RAG retrieval pipeline
- Context construction for LLM prompts
- OpenAI-powered question answering
- Source chunks returned with answers
- Dockerized PostgreSQL development environment
- Automated test suite

## Architecture

```text
                         FastAPI API
                              |
          +-------------------+-------------------+
          |                   |                   |
          v                   v                   v
    Upload API          Search API            Ask API
          |                   |                   |
          v                   v                   v
 Text Extraction         Embeddings        RAG Retriever
          |                   |                   |
          v                   v                   v
      Chunking            pgvector        Context Builder
          |                   |                   |
          +-------------------+-------------------+
                              |
                              v
                         OpenAI LLM
                              |
                              v
                       Answer + Sources
```

## RAG Pipeline

```text
Document
   |
   v
Text Extraction
   |
   v
Chunking
   |
   v
Embedding Generation
   |
   v
PostgreSQL + pgvector
   |
   v
Semantic Retrieval
   |
   v
Relevant Context
   |
   v
OpenAI
   |
   v
Answer + Source Chunks
```

## Tech Stack

### Backend

- Python 3.13
- FastAPI
- Uvicorn
- Pydantic

### AI / NLP

- Sentence Transformers
- `all-MiniLM-L6-v2`
- OpenAI API
- Retrieval-Augmented Generation (RAG)

### Database

- PostgreSQL 17
- pgvector
- SQLAlchemy
- Psycopg

### Document Processing

- pypdf
- python-docx

### Development

- Docker
- Docker Compose
- pytest
- Git
- Bash / Shell scripting

## API Endpoints

### Health

```http
GET /health
```

### Upload a document

```http
POST /documents/upload
```

Accepts PDF and DOCX files.

### List documents

```http
GET /documents
```

### Keyword search

```http
GET /documents/search?q=python
```

### Semantic search

```http
GET /documents/semantic-search?q=cloud%20monitoring
```

Returns document chunks ranked by semantic similarity.

### Ask questions about documents

```http
POST /documents/ask
Content-Type: application/json
```

Example request:

```json
{
  "question": "Which AWS services does the document mention?"
}
```

Example response:

```json
{
  "answer": "The document mentions AWS EC2, S3, VPC, IAM and CloudWatch.",
  "sources": [
    {
      "document_id": "document-id",
      "chunk_index": 0,
      "content": "Relevant document content...",
      "similarity": 0.47
    }
  ]
}
```

### Get a document

```http
GET /documents/{document_id}
```

### Delete a document

```http
DELETE /documents/{document_id}
```

## Project Structure

```text
ai-document-intelligence/
|
+-- app/
|   +-- api/
|   |   +-- routes/
|   |       +-- documents.py
|   |
|   +-- core/
|   |   +-- config.py
|   |
|   +-- db/
|   |   +-- models.py
|   |   +-- session.py
|   |
|   +-- schemas/
|   |   +-- documents.py
|   |
|   +-- services/
|       +-- context_builder.py
|       +-- document_search.py
|       +-- document_storage.py
|       +-- embedding_service.py
|       +-- llm_service.py
|       +-- rag_retriever.py
|       +-- text_chunker.py
|       +-- text_extractor.py
|
+-- tests/
|   +-- test_context_builder.py
|   +-- test_document_ask_api.py
|   +-- test_document_search.py
|   +-- test_document_storage.py
|   +-- test_documents.py
|   +-- test_embedding_service.py
|   +-- test_health.py
|   +-- test_llm_service.py
|   +-- test_rag_retriever.py
|   +-- test_semantic_search_api.py
|   +-- test_text_chunker.py
|   +-- test_text_extractor.py
|
+-- docker-compose.yml
+-- requirements.txt
+-- README.md
```

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/elviDev/ai-document-intelligence.git
cd ai-document-intelligence
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

On Windows:

```cmd
.venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file:

```env
POSTGRES_DB=ai_documents
POSTGRES_USER=ai_user
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5433

OPENAI_API_KEY=your_openai_api_key
```

Never commit `.env` to Git.

### 5. Start PostgreSQL and pgvector

```bash
docker compose up -d
```

### 6. Start the API

```bash
uvicorn app.main:app --reload
```

Swagger UI:

```text
http://127.0.0.1:8000/docs
```

## Testing

Run the complete test suite:

```bash
pytest
```

The project currently contains 25 automated tests covering:

- Document processing
- Storage
- Text extraction
- Chunking
- Embedding generation
- Semantic search
- RAG retrieval
- Context building
- LLM integration
- API behavior

## Current Limitations

- PDF extraction currently depends on a usable text layer.
- Image-only or scanned PDFs require OCR and are not currently supported.
- Authentication and multi-user access are not implemented.
- The current project is a backend API rather than a complete SaaS product.
- Production deployment, billing, multi-tenancy, and user management are outside the current MVP scope.

## Future Direction

Potential future capabilities include:

- OCR for scanned documents
- Multi-user authentication
- Multi-tenancy
- Document permissions
- Conversation history
- Document comparison
- Structured document extraction
- Advanced citations
- Background processing
- Cloud object storage
- Usage tracking and billing
- Web-based user interface

## Status

**Core AI Document Intelligence API: Complete**

The current MVP supports the following end-to-end workflow:

```text
Document ingestion
    ->
Text extraction
    ->
Chunking
    ->
Embedding generation
    ->
Vector storage
    ->
Semantic retrieval
    ->
RAG context construction
    ->
LLM question answering
    ->
Source-aware responses
```

The core MVP is intentionally focused on document ingestion, retrieval, and question answering. SaaS capabilities such as authentication, multi-tenancy, billing, production deployment, and a web frontend are planned as a separate next phase.
