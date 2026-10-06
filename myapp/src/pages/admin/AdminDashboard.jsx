import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { API_BASE } from "../../config";

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ title, value, icon, colorClass, bgClass, loading }) {
  return (
    <div className="col-sm-6 col-xl-4">
      <div className="card border-0 shadow-sm rounded-4 h-100">
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div
              className={`rounded-3 d-flex align-items-center justify-content-center ${bgClass}`}
              style={{ width: 48, height: 48 }}
            >
              <i className={`bi ${icon} fs-5 ${colorClass}`}></i>
            </div>
            <span className="badge text-bg-light fw-normal text-muted small">Live</span>
          </div>
          <div className="h2 fw-bold mb-1 text-dark">
            {loading ? (
              <div className="spinner-border spinner-border-sm text-secondary" style={{ width: 20, height: 20 }} />
            ) : (
              value
            )}
          </div>
          <p className="text-muted small mb-0 fw-medium">{title}</p>
        </div>
      </div>
    </div>
  );
}

// ── Quick Nav Card ─────────────────────────────────────────────────────────
function NavCard({ title, description, icon, colorClass, bgClass, to }) {
  return (
    <div className="col-sm-6 col-lg-3">
      <Link to={to} className="text-decoration-none">
        <div
          className="card border-0 shadow-sm rounded-4 h-100 nav-card-hover"
          style={{ transition: "all 0.2s ease", cursor: "pointer" }}
        >
          <div className="card-body p-4 d-flex align-items-start gap-3">
            <div
              className={`rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 ${bgClass}`}
              style={{ width: 44, height: 44 }}
            >
              <i className={`bi ${icon} fs-5 ${colorClass}`}></i>
            </div>
            <div>
              <div className="fw-bold text-dark small">{title}</div>
              <div className="text-muted" style={{ fontSize: "12px" }}>{description}</div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0, lessons: 0, mcqs: 0,
    coding_challenges: 0, exercises: 0, average_progress: 0
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(null);

  useEffect(() => {
    const t0 = Date.now();

    fetch(API_BASE + "/admin/stats")
      .then(r => r.json())
      .then(d => {
        setStats(d);
        setLoading(false);
        setBackendOnline(true);
      })
      .catch(() => {
        setLoading(false);
        setBackendOnline(false);
      });

    fetch(API_BASE + "/admin/students")
      .then(r => r.json())
      .then(d => {
        const sorted = [...d].sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 8);
        setRecentStudents(sorted);
      })
      .catch(() => {});
  }, []);

  const statCards = [
    { title: "Total Students",      value: stats.students,          icon: "bi-people-fill",        colorClass: "text-primary",   bgClass: "bg-primary bg-opacity-10" },
    { title: "Total Lessons",       value: stats.lessons,           icon: "bi-book-fill",           colorClass: "text-success",   bgClass: "bg-success bg-opacity-10" },
    { title: "MCQ Questions",       value: stats.mcqs,              icon: "bi-patch-question-fill", colorClass: "text-warning",   bgClass: "bg-warning bg-opacity-10" },
    { title: "Coding Challenges",   value: stats.coding_challenges, icon: "bi-code-slash",          colorClass: "text-danger",    bgClass: "bg-danger bg-opacity-10"  },
    { title: "Exercises",           value: stats.exercises,         icon: "bi-clipboard2-check-fill",colorClass: "text-purple",  bgClass: "bg-info bg-opacity-10"    },
    { title: "Avg. Progress",       value: `${stats.average_progress}%`, icon: "bi-graph-up-arrow", colorClass: "text-info",     bgClass: "bg-success bg-opacity-10" },
  ];

  const navCards = [
    { title: "Dashboard",         description: "Overview & stats",          icon: "bi-speedometer2",         colorClass: "text-primary",   bgClass: "bg-primary bg-opacity-10",   to: "/admin" },
    { title: "AI Lesson Generator", description: "Generate content with AI",icon: "bi-stars",                colorClass: "text-warning",   bgClass: "bg-warning bg-opacity-10",   to: "/admin/ai-generator" },
    { title: "Lessons",           description: "Manage curriculum modules", icon: "bi-book-half",            colorClass: "text-success",   bgClass: "bg-success bg-opacity-10",   to: "/admin/lessons" },
    { title: "MCQ Questions",     description: "Quiz question bank",        icon: "bi-patch-question-fill",  colorClass: "text-warning",   bgClass: "bg-warning bg-opacity-10",   to: "/admin/questions" },
    { title: "Exercises",         description: "Practice exercises",        icon: "bi-clipboard2-check-fill",colorClass: "text-info",      bgClass: "bg-info bg-opacity-10",      to: "/admin/exercises" },
    { title: "Coding Challenges", description: "Interactive coding tasks",  icon: "bi-code-slash",           colorClass: "text-danger",    bgClass: "bg-danger bg-opacity-10",    to: "/admin/challenges" },
    { title: "Students",          description: "Monitor progress & XP",    icon: "bi-person-badge-fill",    colorClass: "text-purple",    bgClass: "bg-primary bg-opacity-10",   to: "/admin/students" },
    { title: "Analytics",         description: "Charts & performance data", icon: "bi-bar-chart-line-fill",  colorClass: "text-success",   bgClass: "bg-success bg-opacity-10",   to: "/admin/analytics" },
  ];

  const progressColor = (p) => p >= 75 ? "success" : p >= 40 ? "warning" : "danger";

  return (
    <AdminLayout>
      <style>{`
        .nav-card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.12) !important;
        }
        .text-purple { color: #8b5cf6 !important; }
        .bg-purple-subtle { background: #f5f3ff !important; }
        .table-hover tbody tr:hover { background: #f8fafc; }
      `}</style>

      {/* ── Page Header ── */}
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Admin Dashboard</h1>
        <p className="text-muted mb-0">Real-time overview of your AI-Powered Python LMS.</p>
      </div>

      {/* ── Backend Status Banner ── */}
      {backendOnline === false && (
        <div className="alert alert-warning d-flex align-items-center gap-2 mb-4 rounded-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span><strong>Backend Offline</strong> — Could not reach the API. Make sure FastAPI is running on port 8000.</span>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="row g-3 mb-4">
        {statCards.map((c, i) => (
          <StatCard key={i} {...c} loading={loading} />
        ))}
      </div>

      {/* ── Quick Navigation ── */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-header bg-transparent border-0 pt-4 pb-2 px-4">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-grid-3x3-gap-fill text-primary"></i>
            <h5 className="fw-bold mb-0">Quick Navigation</h5>
          </div>
          <p className="text-muted small mb-0 mt-1">Jump directly to any admin section</p>
        </div>
        <div className="card-body px-4 pb-4 pt-2">
          <div className="row g-3">
            {navCards.map((nc, i) => (
              <NavCard key={i} {...nc} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Students Table + System Health ── */}
      <div className="row g-4">
        {/* Recent Student Activity */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-transparent border-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center">
              <div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-trophy-fill text-warning"></i>
                  <h5 className="fw-bold mb-0">Top Students</h5>
                </div>
                <p className="text-muted small mb-0 mt-1">Ranked by XP earned</p>
              </div>
              <Link to="/admin/students" className="btn btn-sm btn-outline-primary rounded-3">
                View All <i className="bi bi-arrow-up-right ms-1"></i>
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      {["#", "Student", "Progress", "XP", "Lessons"].map(h => (
                        <th key={h} className="fw-semibold text-muted border-0 px-4 py-3" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.4px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-5">
                          <div className="spinner-border text-primary" />
                        </td>
                      </tr>
                    ) : recentStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-5 text-muted">
                          <i className="bi bi-people d-block mb-2" style={{ fontSize: 32, opacity: 0.3 }}></i>
                          No students enrolled yet.
                        </td>
                      </tr>
                    ) : recentStudents.map((s, i) => (
                      <tr key={s.email || i}>
                        <td className="px-4 py-3">
                          <span
                            className={`badge rounded-2 fw-bold ${i === 0 ? "text-bg-warning" : i === 1 ? "text-bg-secondary" : i === 2 ? "bg-danger-subtle text-danger" : "text-bg-light text-muted"}`}
                          >
                            #{i + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                              style={{ width: 36, height: 36, background: `hsl(${(i * 47) % 360}, 65%, 55%)`, fontSize: 14, flexShrink: 0 }}
                            >
                              {(s.name || s.email || "S")[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-semibold text-dark" style={{ fontSize: 13 }}>{s.name || "Student"}</div>
                              <div className="text-muted" style={{ fontSize: 11 }}>{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center gap-2">
                            <div className="progress rounded-pill" style={{ width: 80, height: 6 }}>
                              <div
                                className={`progress-bar bg-${progressColor(s.progress || 0)}`}
                                style={{ width: `${s.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-muted fw-medium" style={{ fontSize: 12 }}>{s.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="fw-bold text-warning">
                            <i className="bi bi-lightning-fill me-1"></i>{s.xp || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="badge text-bg-light fw-semibold">{s.completed_lessons || 0} lessons</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-transparent border-0 pt-4 pb-2 px-4">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-activity text-success"></i>
                <h5 className="fw-bold mb-0">System Health</h5>
              </div>
              <p className="text-muted small mb-0 mt-1">Platform service status</p>
            </div>
            <div className="card-body px-4 pb-4">
              {[
                { label: "FastAPI Backend",    status: backendOnline,  icon: "bi-server" },
                { label: "MongoDB Database",   status: backendOnline,  icon: "bi-database-fill" },
                { label: "AI Gemini Service",  status: true,           icon: "bi-stars" },
                { label: "React Frontend",     status: true,           icon: "bi-layout-text-window-reverse" },
              ].map((item, i) => (
                <div key={i} className="d-flex align-items-center justify-content-between py-3 border-bottom border-light">
                  <div className="d-flex align-items-center gap-2">
                    <i className={`bi ${item.icon} text-muted`}></i>
                    <span className="fw-medium text-dark" style={{ fontSize: 13 }}>{item.label}</span>
                  </div>
                  {item.status === null ? (
                    <span className="badge text-bg-secondary">Checking...</span>
                  ) : item.status ? (
                    <span className="badge text-bg-success d-flex align-items-center gap-1">
                      <i className="bi bi-check-circle-fill" style={{ fontSize: 10 }}></i> Online
                    </span>
                  ) : (
                    <span className="badge text-bg-danger d-flex align-items-center gap-1">
                      <i className="bi bi-x-circle-fill" style={{ fontSize: 10 }}></i> Offline
                    </span>
                  )}
                </div>
              ))}

              {/* Quick Stats Summary */}
              <div className="mt-4 p-3 rounded-3 bg-light">
                <div className="small fw-bold text-muted mb-2 text-uppercase" style={{ letterSpacing: "0.4px" }}>Content Summary</div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted small">Total Content Items</span>
                  <span className="fw-bold small text-dark">
                    {loading ? "—" : stats.lessons + stats.mcqs + stats.coding_challenges + stats.exercises}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted small">Platform Completion</span>
                  <span className="fw-bold small text-success">{stats.average_progress}%</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted small">Active Learners</span>
                  <span className="fw-bold small text-primary">{stats.students}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
