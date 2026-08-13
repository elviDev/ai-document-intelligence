import { Bell, Bot, FileText, LayoutDashboard, Settings } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

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
          <div className="storage-card">
            <div className="storage-header">
              <span>Storage</span>
              <strong>24%</strong>
            </div>

            <div className="storage-bar">
              <div className="storage-fill" />
            </div>

            <p>2.4 GB of 10 GB used</p>
          </div>

          <div className="user-card">
            <div className="avatar">IE</div>

            <div className="user-card-info">
              <strong>Ifeanyi Elvis Okeke</strong>
              <span>Free workspace</span>
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
            <button
              type="button"
              className="notification-button"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>

            <div className="profile-pill">
              <span className="avatar small">IE</span>
              <span>Ifeanyi Elvis</span>
            </div>
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
