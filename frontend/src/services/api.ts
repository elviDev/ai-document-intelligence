const API_BASE_URL = "http://127.0.0.1:8000";

export type Document = {
  document_id: string;
  filename: string;
  content_type: string;
  size: number;
  status: string;
};

export type DocumentDetail = Document & {
  extracted_text: string;
};

export type DocumentSearchResult = {
  document_id: string;
  chunk_index: number;
  content: string;
};

export type SemanticSearchResult = {
  document_id: string;
  chunk_index: number;
  content: string;
  similarity: number;
};

export type AskResponse = {
  answer: string;
  sources: SemanticSearchResult[];
};

async function parseError(
  response: Response,
  fallback: string,
): Promise<string> {
  const body = await response.json().catch(() => null);

  if (typeof body?.detail === "string") {
    return body.detail;
  }

  return fallback;
}

export async function getDocuments(): Promise<Document[]> {
  const response = await fetch(`${API_BASE_URL}/documents`);

  if (!response.ok) {
    throw new Error(
      await parseError(response, "Failed to load documents."),
    );
  }

  return response.json();
}

export async function getDocument(
  documentId: string,
): Promise<DocumentDetail> {
  const response = await fetch(
    `${API_BASE_URL}/documents/${documentId}`,
  );

  if (!response.ok) {
    throw new Error(
      await parseError(response, "Failed to load document."),
    );
  }

  return response.json();
}

export async function uploadDocument(
  file: File,
): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/documents/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(
      await parseError(response, "Failed to upload document."),
    );
  }

  return response.json();
}

export async function deleteDocument(
  documentId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/documents/${documentId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(
      await parseError(response, "Failed to delete document."),
    );
  }
}

export async function searchDocuments(
  query: string,
): Promise<DocumentSearchResult[]> {
  const response = await fetch(
    `${API_BASE_URL}/documents/search?q=${encodeURIComponent(query)}`,
  );

  if (!response.ok) {
    throw new Error(
      await parseError(response, "Failed to search documents."),
    );
  }

  return response.json();
}

export async function semanticSearchDocuments(
  query: string,
): Promise<SemanticSearchResult[]> {
  const response = await fetch(
    `${API_BASE_URL}/documents/semantic-search?q=${encodeURIComponent(query)}`,
  );

  if (!response.ok) {
    throw new Error(
      await parseError(
        response,
        "Failed to perform semantic search.",
      ),
    );
  }

  return response.json();
}

export async function askDocuments(
  question: string,
  documentId?: string,
): Promise<AskResponse> {
  const body: {
    question: string;
    document_id?: string;
  } = {
    question,
  };

  if (documentId) {
    body.document_id = documentId;
  }

  const response = await fetch(
    `${API_BASE_URL}/documents/ask`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw new Error(
      await parseError(
        response,
        "Failed to ask the documents.",
      ),
    );
  }

  return response.json();
}