import { Link, useNavigate, useLocation } from "react-router-dom";

// Navigation items — icons use Bootstrap Icons classes
const navItems = [
  { name: "Dashboard",         path: "/admin",             icon: "bi-speedometer2" },
  { name: "Courses",           path: "/admin/courses",     icon: "bi-collection-fill" },
  { name: "Students",          path: "/admin/students",    icon: "bi-person-badge-fill" },
  { name: "Lessons",           path: "/admin/lessons",     icon: "bi-book-half" },
  { name: "MCQ Questions",     path: "/admin/questions",   icon: "bi-patch-question-fill" },
  { name: "Exercises",         path: "/admin/exercises",   icon: "bi-clipboard2-check-fill" },
  { name: "Challenges",        path: "/admin/challenges",  icon: "bi-code-slash" },
  { name: "Interview Qs",      path: "/admin/interview",   icon: "bi-chat-quote-fill" },
  { name: "Analytics",         path: "/admin/analytics",   icon: "bi-bar-chart-line-fill" },
  { name: "AI Generator",      path: "/admin/ai-generator",icon: "bi-stars" },
  { name: "Bulk Import",       path: "/admin/import",      icon: "bi-upload" },
];

function AdminLayout({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const isActive = (path) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  return (
    <>
      <style>{`
        /* ─── Sidebar ─── */
        #admin-sidebar {
          width: 260px;
          min-height: 100vh;
          background: linear-gradient(160deg, #1e2a3a 0%, #0f172a 100%);
          position: fixed;
          top: 0; left: 0;
          display: flex;
          flex-direction: column;
          z-index: 1040;
          overflow-y: auto;
        }

        .sidebar-brand {
          padding: 28px 24px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          text-decoration: none;
        }
        .sidebar-brand-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .sidebar-brand-text { color: #f8fafc; font-size: 15px; font-weight: 700; }
        .sidebar-brand-sub  { color: #94a3b8; font-size: 11px; }

        .sidebar-nav { padding: 20px 12px; flex: 1; }

        .sidebar-section-label {
          font-size: 10px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 0 12px;
          margin: 6px 0 4px;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 10px;
          color: #94a3b8;
          font-size: 13.5px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.15s ease;
          margin-bottom: 2px;
        }
        .sidebar-link:hover { background: rgba(255,255,255,0.07); color: #f1f5f9; }
        .sidebar-link.active {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: #fff;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(99,102,241,0.35);
        }
        .sidebar-link.active i { color: #fff; }
        .sidebar-link i { font-size: 16px; width: 18px; text-align: center; flex-shrink: 0; }

        .sidebar-divider { border-color: rgba(255,255,255,0.07); margin: 8px 0; }

        .sidebar-footer { padding: 16px 12px; }
        .sidebar-logout {
          display: flex; align-items: center; gap: 12px;
          width: 100%; padding: 10px 14px;
          background: transparent; border: none; border-radius: 10px;
          color: #94a3b8; font-size: 13.5px; font-weight: 500;
          cursor: pointer; transition: all 0.15s;
        }
        .sidebar-logout:hover { background: rgba(239,68,68,0.15); color: #f87171; }

        /* ─── Topbar ─── */
        #admin-topbar {
          position: fixed;
          top: 0; left: 260px; right: 0;
          height: 62px;
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px;
          z-index: 1030;
        }
        #admin-topbar .topbar-title { font-size: 15px; font-weight: 600; color: #0f172a; }
        #admin-topbar .topbar-actions { display: flex; align-items: center; gap: 12px; }
        .topbar-bell {
          width: 36px; height: 36px; border-radius: 10px;
          background: #f8fafc; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; color: #64748b;
          transition: background 0.15s;
        }
        .topbar-bell:hover { background: #e2e8f0; }
        .topbar-avatar {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 14px;
        }

        /* ─── Main Content ─── */
        #admin-main {
          margin-left: 260px;
          margin-top: 62px;
          min-height: calc(100vh - 62px);
          background: #f1f5f9;
          padding: 36px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
      `}</style>

      {/* ── Sidebar ── */}
      <aside id="admin-sidebar">
        {/* Brand */}
        <Link to="/admin" className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <i className="bi bi-shield-fill-check text-white" style={{ fontSize: 18 }}></i>
          </div>
          <div>
            <div className="sidebar-brand-text">Admin Portal</div>
            <div className="sidebar-brand-sub">PyLearn LMS</div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main</div>

          {navItems.slice(0, 4).map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.name}</span>
            </Link>
          ))}

          <hr className="sidebar-divider" />
          <div className="sidebar-section-label">Content</div>

          {navItems.slice(4, 8).map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.name}</span>
            </Link>
          ))}

          <hr className="sidebar-divider" />
          <div className="sidebar-section-label">Tools</div>

          {navItems.slice(8).map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.name}</span>
            </Link>
          ))}

        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <hr className="sidebar-divider" />
          <button className="sidebar-logout" onClick={handleLogout}>
            <i className="bi bi-box-arrow-left"></i>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* ── Topbar ── */}
      <header id="admin-topbar">
        <div className="topbar-title">
          <i className="bi bi-shield-fill-check text-primary me-2"></i>
          Admin Panel
        </div>
        <div className="topbar-actions">
          <button className="topbar-bell">
            <i className="bi bi-bell" style={{ fontSize: 16 }}></i>
          </button>
          <div className="topbar-avatar">A</div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main id="admin-main">
        {children}
      </main>
    </>
  );
}

export default AdminLayout;
