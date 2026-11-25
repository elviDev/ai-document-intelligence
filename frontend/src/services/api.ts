const API_BASE_URL_STORAGE_KEY = "docintel.apiBaseUrl";
const DEFAULT_API_BASE_URL = (() => {
  const configuredUrl =
    import.meta.env.VITE_API_BASE_URL?.trim() || "http://127.0.0.1:8000";

  try {
    return normalizeApiBaseUrl(configuredUrl);
  } catch {
    return "http://127.0.0.1:8000";
  }
})();

export type ApiHealth = {
  status: string;
  service: string;
  version: string;
};

export function normalizeApiBaseUrl(value: string): string {
  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Enter a valid API URL, including http:// or https://.");
  }

  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "The API URL must use HTTP or HTTPS and cannot include credentials, a query, or a fragment.",
    );
  }

  return url.toString().replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
  const savedUrl = window.localStorage.getItem(API_BASE_URL_STORAGE_KEY);

  if (!savedUrl) {
    return DEFAULT_API_BASE_URL;
  }

  try {
    return normalizeApiBaseUrl(savedUrl);
  } catch {
    window.localStorage.removeItem(API_BASE_URL_STORAGE_KEY);
    return DEFAULT_API_BASE_URL;
  }
}

export function saveApiBaseUrl(value: string): string {
  const normalizedUrl = normalizeApiBaseUrl(value);
  window.localStorage.setItem(API_BASE_URL_STORAGE_KEY, normalizedUrl);
  return normalizedUrl;
}

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

export async function checkApiHealth(
  baseUrl: string = getApiBaseUrl(),
): Promise<ApiHealth> {
  const response = await fetch(`${normalizeApiBaseUrl(baseUrl)}/health`);

  if (!response.ok) {
    throw new Error(
      await parseError(response, "Could not connect to the API."),
    );
  }

  const data: unknown = await response.json();

  if (
    typeof data !== "object" ||
    data === null ||
    !("status" in data) ||
    typeof data.status !== "string" ||
    !("service" in data) ||
    typeof data.service !== "string" ||
    !("version" in data) ||
    typeof data.version !== "string"
  ) {
    throw new Error("The API returned an invalid health response.");
  }

  return {
    status: data.status,
    service: data.service,
    version: data.version,
  };
}

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
  const response = await fetch(`${getApiBaseUrl()}/documents`);

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
    `${getApiBaseUrl()}/documents/${documentId}`,
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
    `${getApiBaseUrl()}/documents/upload`,
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
    `${getApiBaseUrl()}/documents/${documentId}`,
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
    `${getApiBaseUrl()}/documents/search?q=${encodeURIComponent(query)}`,
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
    `${getApiBaseUrl()}/documents/semantic-search?q=${encodeURIComponent(query)}`,
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
    `${getApiBaseUrl()}/documents/ask`,
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