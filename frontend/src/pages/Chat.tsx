import {
  Bot,
  FileText,
  LoaderCircle,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  askDocuments,
  getDocuments,
  type AskResponse,
  type Document,
} from "../services/api";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  response?: AskResponse;
};

const suggestedQuestions = [
  "Summarize this document for me.",
  "What are the main points in this document?",
  "What important information does this document contain?",
];

export default function Chat() {
  const [searchParams] = useSearchParams();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] =
    useState<string>(searchParams.get("documentId") ?? "");

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDocuments() {
      try {
        setLoadingDocuments(true);

        const data = await getDocuments();
        setDocuments(data);

        const requestedDocumentId =
          searchParams.get("documentId");

        if (
          requestedDocumentId &&
          data.some(
            (document) =>
              document.document_id === requestedDocumentId,
          )
        ) {
          setSelectedDocumentId(requestedDocumentId);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load documents.",
        );
      } finally {
        setLoadingDocuments(false);
      }
    }

    loadDocuments();
  }, [searchParams]);

  const selectedDocument = documents.find(
    (document) =>
      document.document_id === selectedDocumentId,
  );

  async function submitQuestion(value?: string) {
    const trimmedQuestion = (value ?? question).trim();

    if (!trimmedQuestion || asking) {
      return;
    }

    if (!selectedDocumentId) {
      setError(
        "Select a document before asking a document-specific question.",
      );
      return;
    }

    setError("");

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setAsking(true);

    try {
      const response = await askDocuments(
        trimmedQuestion,
        selectedDocumentId,
      );

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.answer,
        response,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to get an answer.",
      );
    } finally {
      setAsking(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitQuestion();
    }
  }

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div>
          <p className="eyebrow">AI workspace</p>

          <h1>Ask your documents</h1>

          <p className="page-description">
            Select a document, then ask questions grounded only in
            that document.
          </p>
        </div>

        <Link
          to="/documents"
          className="secondary-button"
        >
          Browse documents
        </Link>
      </header>

      <section className="chat-document-selector">
        <div>
          <span className="chat-selector-label">
            Document
          </span>

          <strong>
            {selectedDocument
              ? selectedDocument.filename
              : "Choose a document"}
          </strong>
        </div>

        <select
          value={selectedDocumentId}
          onChange={(event) => {
            setSelectedDocumentId(event.target.value);
            setMessages([]);
            setError("");
          }}
          disabled={
            loadingDocuments ||
            documents.length === 0 ||
            asking
          }
        >
          <option value="">
            {loadingDocuments
              ? "Loading documents..."
              : documents.length === 0
                ? "No documents available"
                : "Select a document"}
          </option>

          {documents.map((document) => (
            <option
              key={document.document_id}
              value={document.document_id}
            >
              {document.filename}
            </option>
          ))}
        </select>
      </section>

      <div className="chat-layout">
        <section className="chat-main-panel">
          <div className="conversation">
            {!selectedDocumentId ? (
              <div className="chat-welcome">
                <div className="chat-welcome-icon">
                  <FileText size={24} />
                </div>

                <h2>Select a document first</h2>

                <p>
                  DocIntel will use only the selected document when
                  answering your questions.
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="chat-welcome">
                <div className="chat-welcome-icon">
                  <Sparkles size={24} />
                </div>

                <h2>
                  Ask about{" "}
                  {selectedDocument?.filename}
                </h2>

                <p>
                  Ask for a summary, specific facts, key points, or
                  anything else contained in this document.
                </p>

                <div className="suggested-questions">
                  {suggestedQuestions.map(
                    (suggestion) => (
                      <button
                        type="button"
                        className="suggestion"
                        key={suggestion}
                        onClick={() =>
                          submitQuestion(suggestion)
                        }
                        disabled={asking}
                      >
                        <Sparkles size={14} />
                        {suggestion}
                      </button>
                    ),
                  )}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${
                    message.role === "user"
                      ? "message-user"
                      : "message-assistant"
                  }`}
                >
                  <div className="message-icon">
                    {message.role === "user" ? (
                      <User size={16} />
                    ) : (
                      <Bot size={16} />
                    )}
                  </div>

                  <div className="message-body">
                    <span className="message-role">
                      {message.role === "user"
                        ? "You"
                        : "DocIntel AI"}
                    </span>

                    <div className="message-content">
                      {message.content}
                    </div>

                    {message.role === "assistant" &&
                      message.response && (
                        <SourceList
                          response={message.response}
                        />
                      )}
                  </div>
                </div>
              ))
            )}

            {asking && (
              <div className="message message-assistant">
                <div className="message-icon">
                  <Bot size={16} />
                </div>

                <div className="message-body">
                  <span className="message-role">
                    DocIntel AI
                  </span>

                  <div className="thinking-indicator">
                    <LoaderCircle
                      size={16}
                      className="spin"
                    />
                    Reading the selected document...
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="chat-error">
                {error}
              </div>
            )}
          </div>

          <div className="chat-composer">
            <textarea
              value={question}
              placeholder={
                selectedDocumentId
                  ? "Ask a question about this document..."
                  : "Select a document first..."
              }
              rows={3}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              onKeyDown={handleKeyDown}
              disabled={asking || !selectedDocumentId}
            />

            <div className="composer-footer">
              <span>
                Enter to send · Shift + Enter for a new line
              </span>

              <button
                type="button"
                className="primary-button"
                onClick={() => submitQuestion()}
                disabled={
                  !question.trim() ||
                  asking ||
                  !selectedDocumentId
                }
              >
                {asking ? (
                  <>
                    <LoaderCircle
                      size={16}
                      className="spin"
                    />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Ask AI
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        <aside className="chat-sidebar">
          <div className="chat-sidebar-card">
            <div className="sidebar-card-icon">
              <Sparkles size={18} />
            </div>

            <h3>Grounded answers</h3>

            <p>
              Answers are generated using retrieved content from
              the document you selected.
            </p>
          </div>

          <div className="chat-sidebar-card">
            <div className="sidebar-card-icon blue">
              <FileText size={18} />
            </div>

            <h3>Source-aware answers</h3>

            <p>
              Each answer includes the source chunks used to
              generate the response.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

type SourceListProps = {
  response: AskResponse;
};

function SourceList({ response }: SourceListProps) {
  if (!response.sources.length) {
    return (
      <div className="no-sources">
        No supporting source chunks were returned.
      </div>
    );
  }

  return (
    <div className="source-list">
      <div className="source-heading">
        Sources
      </div>

      {response.sources.map((source, index) => (
        <div
          className="source-card"
          key={`${source.document_id}-${source.chunk_index}-${index}`}
        >
          <div className="source-card-top">
            <div className="source-file">
              <FileText size={14} />

              <span>
                Chunk {source.chunk_index}
              </span>
            </div>

            <span className="similarity-badge">
              {(source.similarity * 100).toFixed(1)}%
            </span>
          </div>

          <p>{source.content}</p>

          <Link
            to={`/documents/${source.document_id}`}
            className="source-link"
          >
            View document →
          </Link>
        </div>
      ))}
    </div>
  );
}