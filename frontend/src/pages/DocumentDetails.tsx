import {
  ArrowLeft,
  CalendarDays,
  FileText,
  LoaderCircle,
  MessageCircle,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { deleteDocument, getDocument, type Document } from "../services/api";

export default function DocumentDetails() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDocument() {
      if (!documentId) {
        setError("Document ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getDocument(documentId);
        setDocument(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load document.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDocument();
  }, [documentId]);

  async function handleDelete() {
    if (!documentId || !document) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${document.filename}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteDocument(documentId);

      navigate("/documents");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete document.",
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="page-shell">
        <div className="empty-state">
          <LoaderCircle size={28} className="spin" />
          <span>Loading document...</span>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="page-shell">
        <div className="page-header">
          <div>
            <p className="eyebrow">Document</p>
            <h1>Unable to open document</h1>
          </div>

          <Link to="/documents" className="secondary-button">
            <ArrowLeft size={16} />
            Back to documents
          </Link>
        </div>

        <div className="page-error">{error || "Document not found."}</div>
      </div>
    );
  }

  const isPdf = document.content_type === "application/pdf";
  const fileType = isPdf ? "PDF" : "DOCX";

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <Link to="/documents" className="back-link">
            <ArrowLeft size={15} />
            Documents
          </Link>

          <p className="eyebrow">Document details</p>

          <h1>{document.filename}</h1>

          <p className="page-description">
            View document metadata and continue working with this document.
          </p>
        </div>

        <div className="details-header-actions">
          <Link
  to={`/chat?documentId=${document.document_id}`}
  className="secondary-button"
>
            <MessageCircle size={16} />
            Ask AI
          </Link>

          <button
            type="button"
            className="danger-button"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <LoaderCircle size={16} className="spin" />
            ) : (
              <Trash2 size={16} />
            )}
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </header>

      <section className="document-detail-grid">
        <div className="detail-card">
          <div className="detail-icon">
            <FileText size={28} />
          </div>

          <div>
            <span className="detail-label">Filename</span>
            <strong className="detail-value">{document.filename}</strong>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon">
            <FileText size={28} />
          </div>

          <div>
            <span className="detail-label">File type</span>
            <strong className="detail-value">{fileType}</strong>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon">
            <CalendarDays size={28} />
          </div>

          <div>
            <span className="detail-label">Status</span>
            <strong className="detail-value">{document.status}</strong>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-icon">
            <FileText size={28} />
          </div>

          <div>
            <span className="detail-label">File size</span>
            <strong className="detail-value">
              {(document.size / 1024).toFixed(1)} KB
            </strong>
          </div>
        </div>
      </section>

      <section className="document-info-panel">
        <div className="section-heading">
          <div>
            <h2>Document information</h2>
            <span>Stored document metadata</span>
          </div>
        </div>

        <div className="metadata-grid">
          <div className="metadata-item">
            <span>Document ID</span>
            <strong>{document.document_id}</strong>
          </div>

          <div className="metadata-item">
            <span>Content type</span>
            <strong>{document.content_type}</strong>
          </div>

          <div className="metadata-item">
            <span>Status</span>
            <strong>{document.status}</strong>
          </div>

          <div className="metadata-item">
            <span>Size</span>
            <strong>{document.size.toLocaleString()} bytes</strong>
          </div>
        </div>
      </section>

      <section className="document-next-step">
        <div>
          <p className="eyebrow">Next step</p>

          <h2>Ask questions about your documents</h2>

          <p>
            Use the AI chat to search your document collection and get answers
            backed by relevant source chunks.
          </p>
        </div>

        <Link
  to={`/chat?documentId=${document.document_id}`}
  className="secondary-button"
>
          <MessageCircle size={16} />
          Open AI Chat
        </Link>
      </section>
    </div>
  );
}
