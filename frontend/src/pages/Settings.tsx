import {
  CheckCircle2,
  LoaderCircle,
  Server,
  Settings2,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import {
  checkApiHealth,
  getApiBaseUrl,
  saveApiBaseUrl,
  type ApiHealth,
} from "../services/api";

export default function Settings() {
  const [apiBaseUrl, setApiBaseUrl] = useState(getApiBaseUrl);
  const [savedApiBaseUrl, setSavedApiBaseUrl] = useState(apiBaseUrl);
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleTestConnection() {
    setTesting(true);
    setError("");
    setNotice("");
    setHealth(null);

    try {
      setHealth(await checkApiHealth(apiBaseUrl));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not connect to the API.",
      );
    } finally {
      setTesting(false);
    }
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setHealth(null);

    try {
      const savedUrl = saveApiBaseUrl(apiBaseUrl);
      setApiBaseUrl(savedUrl);
      setSavedApiBaseUrl(savedUrl);
      setNotice("API URL saved in this browser.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save the API URL.",
      );
    }
  }

  const isHealthy = health?.status.toLowerCase() === "healthy";

  return (
    <div className="page-shell settings-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Settings</h1>
          <p className="page-description">
            Configure the API connection used by this browser.
          </p>
        </div>
      </header>

      <div className="settings-stack">
        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-icon">
              <Server size={19} />
            </div>
            <div>
              <h2>API connection</h2>
              <p>
                Set the base URL for your AI Document Intelligence API.
              </p>
            </div>
          </div>

          <form className="settings-form" onSubmit={handleSave}>
            <label className="settings-label" htmlFor="api-base-url">
              API base URL
            </label>
            <input
              id="api-base-url"
              className="settings-input"
              type="url"
              value={apiBaseUrl}
              onChange={(event) => {
                setApiBaseUrl(event.target.value);
                setHealth(null);
                setError("");
                setNotice("");
              }}
              placeholder="http://127.0.0.1:8000"
              required
            />
            <p className="settings-help">
              Include the protocol, for example{" "}
              <code>http://127.0.0.1:8000</code>. This setting is saved in
              local browser storage and overrides <code>VITE_API_BASE_URL</code>.
            </p>

            <div className="settings-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleTestConnection}
                disabled={testing || !apiBaseUrl.trim()}
              >
                {testing ? (
                  <>
                    <LoaderCircle size={16} className="spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Settings2 size={16} />
                    Test connection
                  </>
                )}
              </button>
              <button type="submit" className="primary-button">
                Save API URL
              </button>
            </div>
          </form>

          {error && (
            <div className="settings-feedback error" role="alert">
              <XCircle size={17} />
              <span>{error}</span>
            </div>
          )}
          {notice && (
            <div className="settings-feedback success" role="status">
              <CheckCircle2 size={17} />
              <span>{notice}</span>
            </div>
          )}
          {health && (
            <div
              className={`settings-feedback ${isHealthy ? "success" : "warning"}`}
              role="status"
            >
              {isHealthy ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
              <span>
                Connected to {health.service} · status: {health.status} ·
                version {health.version}
              </span>
            </div>
          )}
        </section>

        <section className="settings-card settings-info-card">
          <h2>About this workspace</h2>
          <dl>
            <div>
              <dt>Account</dt>
              <dd>Not configured in this MVP</dd>
            </div>
            <div>
              <dt>Documents</dt>
              <dd>Stored by the configured API service</dd>
            </div>
            <div>
              <dt>API URL</dt>
              <dd>
                <code>{savedApiBaseUrl}</code>
              </dd>
            </div>
          </dl>
          <p className="settings-help">
            This frontend does not currently provide authentication, team
            accounts, or cloud storage quotas.
          </p>
        </section>
      </div>
    </div>
  );
}