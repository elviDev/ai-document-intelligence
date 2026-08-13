import {
  ArrowRight,
  Bot,
  FileText,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  getDocuments,
  uploadDocument,
  type Document,
} from "../services/api";

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        err instanceof Error
          ? err.message
          : "Failed to load documents.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleFileSelected(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);
      setError("");

      await uploadDocument(file);
      await loadDocuments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload document.",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  const recentDocuments = documents.slice(0, 5);

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Workspace</p>

          <h1>Turn your documents into answers.</h1>

          <p>
            Upload your files, search their content, and ask questions using
            AI-powered document retrieval.
          </p>
        </div>

        <div className="dashboard-hero-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            hidden
            onChange={handleFileSelected}
          />

          <button
            type="button"
            className="primary-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload size={17} />

            {uploading ? "Uploading..." : "Upload document"}
          </button>
        </div>
      </section>

      {error && <div className="page-error">{error}</div>}

      <section className="dashboard-stats">
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon purple">
            <FileText size={19} />
          </div>

          <div>
            <span>Total documents</span>
            <strong>{loading ? "—" : documents.length}</strong>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon blue">
            <Sparkles size={19} />
          </div>

          <div>
            <span>Semantic search</span>
            <strong>Ready</strong>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon green">
            <Bot size={19} />
          </div>

          <div>
            <span>AI question answering</span>
            <strong>Ready</strong>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon orange">
            <Search size={19} />
          </div>

          <div>
            <span>Document search</span>
            <strong>Ready</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Recent documents</h2>
              <p>Your latest uploaded files</p>
            </div>

            <Link to="/documents" className="panel-link">
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="dashboard-empty">
              Loading documents...
            </div>
          ) : recentDocuments.length === 0 ? (
            <div className="dashboard-empty">
              <FileText size={28} />

              <strong>No documents yet</strong>

              <span>
                Upload a PDF or DOCX to start using DocIntel.
              </span>
            </div>
          ) : (
            <div className="dashboard-document-list">
              {recentDocuments.map((document) => {
                const isPdf =
                  document.content_type === "application/pdf";

                return (
                  <Link
                    key={document.document_id}
                    to={`/documents/${document.document_id}`}
                    className="dashboard-document-row"
                  >
                    <div className="dashboard-document-icon">
                      <FileText size={18} />
                    </div>

                    <div className="dashboard-document-info">
                      <strong>{document.filename}</strong>

                      <span>
                        {isPdf ? "PDF" : "DOCX"}
                        {" · "}
                        {(document.size / 1024).toFixed(1)} KB
                      </span>
                    </div>

                    <span className="dashboard-document-status">
                      {document.status}
                    </span>

                    <ArrowRight size={16} />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Ask your documents</h2>
              <p>Get grounded answers from your files</p>
            </div>
          </div>

          <div className="dashboard-chat-card">
            <div className="dashboard-chat-icon">
              <Sparkles size={22} />
            </div>

            <h3>Need an answer?</h3>

            <p>
              Ask a question about a specific document and DocIntel will
              retrieve relevant content before generating the answer.
            </p>

            <Link to="/chat" className="secondary-button">
              Open AI Chat
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section className="dashboard-upload-card">
        <div className="dashboard-upload-icon">
          <Upload size={21} />
        </div>

        <div>
          <h2>Upload a new document</h2>

          <p>
            PDF and DOCX files with a readable text layer are supported.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Browse files"}
        </button>
      </section>
    </div>
  );
}