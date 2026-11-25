import { Bot, FileText, LayoutDashboard, Settings } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";

function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">AI</div>

          <div>
            <h1>DocIntel</h1>
            <span>Document Intelligence</span>
          </div>
        </div>

        <nav className="nav-menu" aria-label="Primary navigation">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/documents"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <FileText size={18} />
            <span>Documents</span>
          </NavLink>

          <NavLink
            to="/chat"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <Bot size={18} />
            <span>AI Chat</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <Link to="/settings" className="storage-card settings-connection-link">
            <div className="storage-header">
              <span>API connection</span>
              <Settings size={15} />
            </div>
            <p>Configure service URL</p>
          </Link>

          <div className="user-card">
            <div className="avatar">LW</div>

            <div className="user-card-info">
              <strong>Local workspace</strong>
              <span>Single-user MVP</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div>
            <span className="eyebrow">Workspace</span>
            <h2>DocIntel</h2>
          </div>

          <div className="topbar-actions">
            <Link
              to="/settings"
              className="profile-pill"
              aria-label="API settings"
            >
              <Settings size={16} />
              <span>API settings</span>
            </Link>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
