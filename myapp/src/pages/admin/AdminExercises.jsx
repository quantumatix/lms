import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { Toast, useToast } from "../../components/Toast";
import { Plus, Edit, Trash2, FileCode, Save, X } from "lucide-react";

const inputStyle = {
  width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb",
  borderRadius: "10px", fontSize: "13px", outline: "none",
  transition: "border-color 0.2s", fontFamily: "inherit", boxSizing: "border-box",
};
const labelStyle = {
  display: "block", fontSize: "12px", fontWeight: 600, color: "#374151",
  marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px",
};

function AdminExercises() {
  const { toasts, addToast, removeToast } = useToast();
  const [exercises, setExercises] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editExercise, setEditExercise] = useState(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { id: "", lesson_id: "", title: "", type: "Output Prediction", question: "", code: "", expected_answer: "", hint: "", explanation: "" };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => { fetchLessons(); fetchExercises(); }, []);

  const fetchLessons = () => {
    fetch("http://127.0.0.1:8000/admin/lessons")
      .then(r => r.json())
      .then(d => setLessons(Array.isArray(d) ? d : []));
  };

  const fetchExercises = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/admin/exercises")
      .then(r => r.json())
      .then(d => { setExercises(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleOpenModal = (ex = null) => {
    if (ex) {
      setEditExercise(ex);
      setFormData({ ...emptyForm, ...ex });
    } else {
      setEditExercise(null);
      setFormData({ ...emptyForm, id: `ex_${Date.now()}`, lesson_id: lessons[0]?.id || "" });
    }
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    const isEditing = editExercise !== null;
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `http://127.0.0.1:8000/admin/exercises/${editExercise.id}` : "http://127.0.0.1:8000/admin/exercises";
    fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) })
      .then(r => r.json())
      .then(() => {
        setShowModal(false); setSaving(false); fetchExercises();
        addToast(isEditing ? "Exercise updated!" : "Exercise created!", "success");
      })
      .catch(err => { setSaving(false); addToast("Error: " + err.message, "error"); });
  };

  const handleDelete = (exerciseId) => {
    if (window.confirm("Delete this exercise?")) {
      fetch(`http://127.0.0.1:8000/admin/exercises/${exerciseId}`, { method: "DELETE" })
        .then(() => { fetchExercises(); addToast("Exercise deleted.", "success"); });
    }
  };

  const getLessonTitle = (id) => lessons.find(l => l.id === id)?.title || id;

  return (
    <AdminLayout>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Exercise Management</h1>
          <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0, marginTop: "4px" }}>Manage hands-on practice tasks for each lesson</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "linear-gradient(135deg,#0ea5e9,#0284c7)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(14,165,233,0.4)" }}
        >
          <Plus size={17} /> New Exercise
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}><div className="spinner-border text-info" /></div>
      ) : exercises.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "16px" }}>
          <FileCode size={56} style={{ color: "#d1d5db", marginBottom: "12px" }} />
          <h3 style={{ color: "#9ca3af", fontWeight: 500 }}>No exercises yet. Add one to get started.</h3>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", margin: 0 }}>All Exercises</h3>
            <span style={{ background: "#f0f9ff", color: "#0ea5e9", fontWeight: 700, fontSize: "12px", padding: "4px 14px", borderRadius: "20px" }}>{exercises.length} Total</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Title / Question", "Lesson", "Type", "Expected Answer", "Hint", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.5px", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exercises.map((ex, i) => (
                <tr key={ex.id || i} style={{ borderTop: "1px solid #f1f5f9", transition: "background 0.15s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 20px", maxWidth: "250px" }}>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ex.title ? `${ex.title}: ` : ""}{ex.question}
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ background: "#ecfdf5", color: "#059669", fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px" }}>{getLessonTitle(ex.lesson_id)}</span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ background: "#eef2ff", color: "#6366f1", fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px" }}>
                      {ex.type}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: "12px", color: "#475569", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <code>{ex.expected_answer}</code>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: "12px", color: "#9ca3af", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ex.hint || <em>No hint</em>}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button onClick={() => handleOpenModal(ex)} style={{ padding: "6px 8px", background: "#eef2ff", border: "none", borderRadius: "8px", cursor: "pointer", color: "#6366f1", display: "flex", alignItems: "center" }}><Edit size={14} /></button>
                      <button onClick={() => handleDelete(ex.id)} style={{ padding: "6px 8px", background: "#fef2f2", border: "none", borderRadius: "8px", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center" }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", width: "560px", maxHeight: "90vh", overflowY: "auto", padding: "32px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>{editExercise ? "Edit Exercise" : "New Exercise"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: "10px", padding: "8px", cursor: "pointer" }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={labelStyle}>Assign to Lesson</label>
                  <select style={inputStyle} value={formData.lesson_id} onChange={e => setFormData({ ...formData, lesson_id: e.target.value })} required>
                    <option value="">Select lesson...</option>
                    {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Exercise Type</label>
                  <select style={inputStyle} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                    <option value="Output Prediction">Output Prediction</option>
                    <option value="Fill in the Blank">Fill in the Blank</option>
                    <option value="Debug the Code">Debug the Code</option>
                    <option value="Short Coding Exercise">Short Coding Exercise</option>
                    <option value="Code Completion">Code Completion</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Title</label>
                <input type="text" style={inputStyle} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Exercise title..." required />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Question</label>
                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }} value={formData.question} onChange={e => setFormData({ ...formData, question: e.target.value })} required />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Python Code (Optional)</label>
                <textarea 
                  style={{ ...inputStyle, resize: "vertical", minHeight: "100px", fontFamily: "monospace", backgroundColor: "#f8fafc", borderColor: "#cbd5e1" }} 
                  value={formData.code} 
                  onChange={e => setFormData({ ...formData, code: e.target.value })} 
                  placeholder="# Write your Python code template here"
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Expected Answer</label>
                <input type="text" style={inputStyle} value={formData.expected_answer} onChange={e => setFormData({ ...formData, expected_answer: e.target.value })} placeholder="Expected solution value or code..." required />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Hint (optional)</label>
                <input type="text" style={inputStyle} value={formData.hint} onChange={e => setFormData({ ...formData, hint: e.target.value })} placeholder="A helpful hint for students..." />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Explanation</label>
                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }} value={formData.explanation} onChange={e => setFormData({ ...formData, explanation: e.target.value })} placeholder="Explanation detailing step-by-step solution..." required />
              </div>

              <button type="submit" disabled={saving}
                style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#0ea5e9,#0284c7)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 12px rgba(14,165,233,0.4)" }}>
                {saving ? <div className="spinner-border spinner-border-sm" /> : <Save size={16} />}
                {saving ? "Saving..." : (editExercise ? "Update Exercise" : "Save Exercise")}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminExercises;
