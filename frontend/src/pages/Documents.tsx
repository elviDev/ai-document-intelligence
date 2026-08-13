import { Eye, FileText, LoaderCircle, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  deleteDocument,
  getDocuments,
  searchDocuments,
  semanticSearchDocuments,
  type Document,
  type DocumentSearchResult,
  type SemanticSearchResult,
} from "../services/api";

type SearchMode = "all" | "keyword" | "semantic";

type SearchResult = {
  document_id: string;
  chunk_index: number;
  content: string;
  similarity?: number;
};

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("all");

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      setLoading(true);
      setError("");

      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load documents.",
      );
    } finally {
      setLoading(false);
    }
  }

  function clearSearch() {
    setQuery("");
    setSearchResults([]);
    setError("");
  }

  async function handleSearch() {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      clearSearch();
      return;
    }

    if (searchMode === "all") {
      const matches = documents.filter((document) =>
        document.filename.toLowerCase().includes(trimmedQuery.toLowerCase()),
      );

      setSearchResults(
        matches.map((document) => ({
          document_id: document.document_id,
          chunk_index: 0,
          content: document.filename,
        })),
      );

      return;
    }

    try {
      setSearching(true);
      setError("");

      if (searchMode === "keyword") {
        const data = await searchDocuments(trimmedQuery);

        setSearchResults(
          data.map((item: DocumentSearchResult) => ({
            document_id: item.document_id,
            chunk_index: item.chunk_index,
            content: item.content,
          })),
        );
      }

      if (searchMode === "semantic") {
        const data = await semanticSearchDocuments(trimmedQuery);

        setSearchResults(
          data.map((item: SemanticSearchResult) => ({
            document_id: item.document_id,
            chunk_index: item.chunk_index,
            content: item.content,
            similarity: item.similarity,
          })),
        );
      }
    } catch (err) {
      setSearchResults([]);
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setSearching(false);
    }
  }

  async function handleDelete(documentId: string) {
    const confirmed = window.confirm(
      "Delete this document? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(documentId);
      setError("");

      await deleteDocument(documentId);

      setDocuments((current) =>
        current.filter((document) => document.document_id !== documentId),
      );

      setSearchResults((current) =>
        current.filter((result) => result.document_id !== documentId),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete document.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const hasSearch = query.trim().length > 0;
  const showSearchResults = hasSearch && searchMode !== "all";
  const showAllResults = hasSearch && searchMode === "all";

  const filenameMatches = documents.filter((document) =>
    document.filename.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Library</p>

          <h1>Documents</h1>

          <p className="page-description">
            Manage your documents and search their contents.
          </p>
        </div>

        <Link to="/dashboard" className="secondary-button">
          Back to dashboard
        </Link>
      </header>

      <section className="search-panel">
        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            value={query}
            placeholder="Search your documents..."
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }

              if (event.key === "Escape") {
                clearSearch();
              }
            }}
          />

          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              ×
            </button>
          )}

          <button
            className="primary-button"
            type="button"
            onClick={handleSearch}
            disabled={searching}
          >
            {searching ? (
              <>
                <LoaderCircle size={16} className="spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </button>
        </div>

        <div className="search-modes">
          <button
            type="button"
            className={
              searchMode === "all" ? "search-mode active" : "search-mode"
            }
            onClick={() => {
              setSearchMode("all");
              setSearchResults([]);
            }}
          >
            All documents
          </button>

          <button
            type="button"
            className={
              searchMode === "keyword" ? "search-mode active" : "search-mode"
            }
            onClick={() => {
              setSearchMode("keyword");
              setSearchResults([]);
            }}
          >
            Keyword
          </button>

          <button
            type="button"
            className={
              searchMode === "semantic" ? "search-mode active" : "search-mode"
            }
            onClick={() => {
              setSearchMode("semantic");
              setSearchResults([]);
            }}
          >
            Semantic
          </button>
        </div>

        <p className="search-hint">
          {searchMode === "all" && "Searches document filenames."}

          {searchMode === "keyword" &&
            "Searches the extracted text of your documents."}

          {searchMode === "semantic" &&
            "Searches by meaning using vector embeddings."}
        </p>
      </section>

      {error && <div className="page-error">{error}</div>}

      {showSearchResults && (
        <section className="results-section">
          <div className="section-heading">
            <div>
              <h2>
                {searchMode === "semantic"
                  ? "Semantic results"
                  : "Keyword results"}
              </h2>

              <span>
                {searchResults.length} result
                {searchResults.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {searchResults.length === 0 ? (
            <div className="empty-state">
              <Search size={28} />

              <strong>No matching content found</strong>

              <span>Try a different search phrase.</span>
            </div>
          ) : (
            <div className="results-list">
              {searchResults.map((result, index) => (
                <article
                  className="result-card"
                  key={`${result.document_id}-${result.chunk_index}-${index}`}
                >
                  <div className="result-card-header">
                    <div className="document-result-icon">
                      <FileText size={18} />
                    </div>

                    <div>
                      <strong>Chunk {result.chunk_index}</strong>

                      {result.similarity !== undefined && (
                        <span>
                          Similarity {(result.similarity * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/documents/${result.document_id}`}
                      className="icon-action"
                      aria-label="View document"
                    >
                      <Eye size={17} />
                    </Link>
                  </div>

                  <p>{result.content}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {showAllResults && (
        <section className="documents-section">
          <div className="section-heading">
            <div>
              <h2>Matching documents</h2>

              <span>
                {filenameMatches.length} document
                {filenameMatches.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {filenameMatches.length === 0 ? (
            <div className="empty-state">
              <Search size={28} />

              <strong>No document matches</strong>

              <span>No filename contains "{query.trim()}".</span>
            </div>
          ) : (
            <DocumentList
              documents={filenameMatches}
              deletingId={deletingId}
              onDelete={handleDelete}
            />
          )}
        </section>
      )}

      {!hasSearch && (
        <section className="documents-section">
          <div className="section-heading">
            <div>
              <h2>All documents</h2>

              <span>
                {documents.length} document
                {documents.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <LoaderCircle size={24} className="spin" />
              <span>Loading documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="empty-state">
              <FileText size={30} />

              <strong>Your library is empty</strong>

              <span>Upload a PDF or DOCX to get started.</span>
            </div>
          ) : (
            <DocumentList
              documents={documents}
              deletingId={deletingId}
              onDelete={handleDelete}
            />
          )}
        </section>
      )}
    </div>
  );
}

type DocumentListProps = {
  documents: Document[];
  deletingId: string | null;
  onDelete: (documentId: string) => void;
};

function DocumentList({ documents, deletingId, onDelete }: DocumentListProps) {
  return (
    <div className="documents-table">
      {documents.map((document) => {
        const isPdf = document.content_type === "application/pdf";

        return (
          <article className="document-card" key={document.document_id}>
            <div className="document-type-icon">
              <FileText size={20} />
            </div>

            <div className="document-card-info">
              <strong>{document.filename}</strong>

              <span>
                {isPdf ? "PDF" : "DOCX"}
                {" · "}
                {(document.size / 1024).toFixed(1)} KB
              </span>
            </div>

            <span className="document-status">{document.status}</span>

            <div className="document-actions">
              <Link
                to={`/documents/${document.document_id}`}
                className="icon-action"
                aria-label="View document"
              >
                <Eye size={17} />
              </Link>

              <button
                type="button"
                className="icon-action danger"
                aria-label={`Delete ${document.filename}`}
                disabled={deletingId === document.document_id}
                onClick={() => onDelete(document.document_id)}
              >
                {deletingId === document.document_id ? (
                  <LoaderCircle size={17} className="spin" />
                ) : (
                  <Trash2 size={17} />
                )}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
