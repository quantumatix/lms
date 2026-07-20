import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { Toast, useToast } from "../../components/Toast";
import { Search, Eye, X, Trophy, BookOpen } from "lucide-react";

function AdminStudents() {
  const { toasts, addToast, removeToast } = useToast();
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submissions, setSubmissions] = useState({ mcq: [], coding: [] });
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/admin/students")
      .then(r => r.json())
      .then(d => { const list = Array.isArray(d) ? d : []; setStudents(list); setFiltered(list); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFiltered(students.filter(s =>
      (s.name || "").toLowerCase().includes(term) || (s.email || "").toLowerCase().includes(term)
    ));
  }, [searchTerm, students]);

  const viewDetails = (student) => {
    setLoadingDetail(true);
    setSelectedStudent(student);
    fetch(`http://127.0.0.1:8000/admin/submissions/${student.email}`)
      .then(r => r.json())
      .then(d => { setSubmissions(d); setLoadingDetail(false); })
      .catch(() => { setSubmissions({ mcq: [], coding: [] }); setLoadingDetail(false); });
  };

  const progressColor = (p) => p >= 75 ? "#10b981" : p >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <AdminLayout>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Student Management</h1>
        <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0, marginTop: "4px" }}>Monitor progress, XP, and review student submissions</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedStudent ? "1fr 360px" : "1fr", gap: "20px" }}>
        {/* Students Table */}
        <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", borderRadius: "10px", padding: "8px 14px", flex: 1, maxWidth: "380px" }}>
              <Search size={16} style={{ color: "#9ca3af" }} />
              <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", width: "100%", color: "#374151" }} />
            </div>
            <span style={{ background: "#eef2ff", color: "#6366f1", fontWeight: 700, fontSize: "12px", padding: "5px 14px", borderRadius: "20px" }}>{filtered.length} Students</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Student", "Progress", "XP Earned", "Lessons Done", ""].map(h => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.5px", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: "40px" }}><div className="spinner-border spinner-border-sm text-primary" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>No students found.</td></tr>
              ) : filtered.map((s) => (
                <tr key={s.email} style={{ borderTop: "1px solid #f1f5f9", cursor: "pointer", background: selectedStudent?.email === s.email ? "#f0f9ff" : "transparent", transition: "background 0.15s" }}
                  onClick={() => viewDetails(s)}
                  onMouseEnter={(e) => { if (selectedStudent?.email !== s.email) e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { if (selectedStudent?.email !== s.email) e.currentTarget.style.background = "transparent"; }}
                >
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: 34, height: 34, borderRadius: "10px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>
                        {(s.name || s.email || "S")[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "13px", color: "#111827" }}>{s.name || "Student"}</div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: 70, height: 5, borderRadius: "3px", background: "#f1f5f9", overflow: "hidden" }}>
                        <div style={{ width: `${s.progress || 0}%`, height: "100%", background: progressColor(s.progress || 0), borderRadius: "3px" }} />
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "#374151" }}>{s.progress || 0}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", fontWeight: 700, color: "#f59e0b", fontSize: "13px" }}>⚡ {s.xp || 0}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ background: "#f1f5f9", color: "#374151", fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "6px" }}>{s.completed_lessons || 0}</span>
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <button onClick={e => { e.stopPropagation(); viewDetails(s); }}
                      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", background: "#eef2ff", color: "#6366f1", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "12px" }}>
                      <Eye size={13} /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Student Detail Panel */}
        {selectedStudent && (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.04)", height: "fit-content" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 48, height: 48, borderRadius: "14px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "20px" }}>
                  {selectedStudent.email[0].toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>{selectedStudent.name || "Student"}</h3>
                  <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>{selectedStudent.email}</div>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer" }}><X size={15} /></button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
              {[
                { label: "XP", value: `⚡ ${selectedStudent.xp || 0}`, color: "#f59e0b", bg: "#fffbeb" },
                { label: "Progress", value: `${selectedStudent.progress || 0}%`, color: "#6366f1", bg: "#eef2ff" },
                { label: "Lessons", value: selectedStudent.completed_lessons || 0, color: "#10b981", bg: "#ecfdf5" },
              ].map((item, i) => (
                <div key={i} style={{ background: item.bg, borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: "16px", color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>{item.label}</div>
                </div>
              ))}
            </div>

            <h4 style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Recent Submissions</h4>
            {loadingDetail ? (
              <div style={{ textAlign: "center", padding: "24px" }}><div className="spinner-border spinner-border-sm text-primary" /></div>
            ) : submissions.mcq.length === 0 && submissions.coding.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", background: "#f8fafc", borderRadius: "10px", fontSize: "13px", color: "#9ca3af" }}>No submissions found.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
                {submissions.mcq.slice(0, 5).map((res, i) => (
                  <div key={`mcq-${i}`} style={{ padding: "12px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "12px", color: "#0f172a", display: "flex", alignItems: "center", gap: "5px" }}>
                        <Trophy size={12} style={{ color: "#f59e0b" }} /> MCQ Quiz
                      </div>
                      <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>{res.lesson_id || "Unknown"}</div>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", background: (res.score / (res.total || 1)) >= 0.7 ? "#ecfdf5" : "#fffbeb", color: (res.score / (res.total || 1)) >= 0.7 ? "#059669" : "#d97706" }}>
                      {res.score}/{res.total}
                    </span>
                  </div>
                ))}
                {submissions.coding.slice(0, 3).map((res, i) => (
                  <div key={`code-${i}`} style={{ padding: "12px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <div style={{ fontWeight: 600, fontSize: "12px", color: "#0f172a", display: "flex", alignItems: "center", gap: "5px" }}>
                        <BookOpen size={12} style={{ color: "#6366f1" }} /> Coding Task
                      </div>
                      <span style={{ fontSize: "10px", fontWeight: 600, color: "#059669", background: "#ecfdf5", padding: "2px 8px", borderRadius: "20px" }}>Passed</span>
                    </div>
                    {res.code && (
                      <div style={{ background: "#0f172a", borderRadius: "6px", padding: "8px", fontFamily: "monospace", fontSize: "10px", color: "#38bdf8", maxHeight: "50px", overflow: "hidden" }}>{res.code.slice(0, 100)}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminStudents;
