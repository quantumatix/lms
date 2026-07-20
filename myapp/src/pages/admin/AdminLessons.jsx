import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { Toast, useToast } from "../../components/Toast";
import { Plus, Edit, Trash2, Search, X, Save, PlusCircle, Trash, Globe, AlertTriangle, BookOpen, Sparkles } from "lucide-react";

const sectionStyle = {
  background: "#fff",
  borderRadius: "16px",
  padding: "28px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  border: "1px solid rgba(0,0,0,0.04)",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1.5px solid #e5e7eb",
  borderRadius: "10px",
  fontSize: "13px",
  outline: "none",
  transition: "border-color 0.2s",
  fontFamily: "inherit",
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.4px",
};

function AdminLessons() {
  const { toasts, addToast, removeToast } = useToast();
  const [lessons, setLessons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [saving, setSaving] = useState(false);

  const [showAIModal, setShowAIModal] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState("Beginner");
  const [generating, setGenerating] = useState(false);

  const handleAIGenerate = (e) => {
    e.preventDefault();
    if (!aiTopic.trim()) {
      addToast("Please enter a topic", "error");
      return;
    }
    setGenerating(true);
    fetch("http://127.0.0.1:8000/admin/ai/generate-lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: aiTopic, difficulty: aiDifficulty })
    })
      .then(r => {
        if (!r.ok) {
          throw new Error("Failed to generate lesson via AI");
        }
        return r.json();
      })
      .then(data => {
        setGenerating(false);
        setShowAIModal(false);
        setAiTopic("");
        fetchLessons();
        addToast("Lesson generated successfully with AI!", "success");
      })
      .catch(err => {
        setGenerating(false);
        addToast("Error generating lesson: " + err.message, "error");
      });
  };

  const emptyForm = {
    id: "", title: "", category_id: "fundamentals", category_title: "Python Fundamentals",
    description: "", theory: "", xp_reward: 50, difficulty: "Beginner",
    code_examples: [], common_mistakes: [], real_world_use_cases: []
  };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => { fetchLessons(); }, []);

  const fetchLessons = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/admin/lessons")
      .then(r => r.json())
      .then(d => { setLessons(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleOpenModal = (lesson = null) => {
    if (lesson) {
      setEditLesson(lesson);
      fetch(`http://127.0.0.1:8000/lessons/${lesson.id}?username=admin@lms.com`)
        .then(r => r.json())
        .then(detail => {
          setFormData({
            id: detail.id, title: detail.title,
            category_id: detail.category_id || "", category_title: detail.category_title || "",
            description: detail.description || "", theory: detail.theory || "",
            xp_reward: detail.xp_reward || 50, difficulty: detail.difficulty || "Beginner",
            code_examples: detail.code_examples || [],
            common_mistakes: detail.common_mistakes || [],
            real_world_use_cases: detail.real_world_use_cases || []
          });
          setShowModal(true);
        });
    } else {
      setEditLesson(null);
      setFormData({ ...emptyForm, id: `lesson_${Date.now()}` });
      setShowModal(true);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    const method = editLesson ? "PUT" : "POST";
    const url = editLesson
      ? `http://127.0.0.1:8000/admin/lessons/${editLesson.id}`
      : "http://127.0.0.1:8000/admin/lessons";
    fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) })
      .then(r => r.json())
      .then(() => {
        setShowModal(false); setSaving(false); fetchLessons();
        addToast(editLesson ? "Lesson updated successfully!" : "Lesson created successfully!", "success");
      })
      .catch(err => { setSaving(false); addToast("Error saving lesson: " + err.message, "error"); });
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this lesson and all its exercises?")) {
      fetch(`http://127.0.0.1:8000/admin/lessons/${id}`, { method: "DELETE" })
        .then(() => { fetchLessons(); addToast("Lesson deleted.", "success"); });
    }
  };

  const addArrayItem = (field, template) => setFormData({ ...formData, [field]: [...formData[field], template] });
  const removeArrayItem = (field, index) => {
    const updated = [...formData[field]]; updated.splice(index, 1);
    setFormData({ ...formData, [field]: updated });
  };

  const filteredLessons = lessons.filter(l =>
    (l.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.category_title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const diffBadge = (d) => {
    if (d === "Beginner") return { bg: "#ecfdf5", color: "#059669" };
    if (d === "Intermediate") return { bg: "#fffbeb", color: "#d97706" };
    return { bg: "#fef2f2", color: "#dc2626" };
  };

  return (
    <AdminLayout>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Lesson Management</h1>
          <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0, marginTop: "4px" }}>Create and manage your Python curriculum modules</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setShowAIModal(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(168,85,247,0.4)" }}
          >
            <Sparkles size={17} /> AI Auto-Generate
          </button>
          <button
            onClick={() => handleOpenModal()}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(99,102,241,0.4)" }}
          >
            <Plus size={17} /> Add Lesson
          </button>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", borderRadius: "10px", padding: "8px 14px", maxWidth: "360px", flex: 1 }}>
            <Search size={16} style={{ color: "#9ca3af" }} />
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", width: "100%", color: "#374151" }}
            />
          </div>
          <span style={{ background: "#eef2ff", color: "#6366f1", fontWeight: 700, fontSize: "12px", padding: "5px 14px", borderRadius: "20px" }}>
            {filteredLessons.length} Lessons
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Title", "Module", "Difficulty", "XP", "MCQs", "Challenges", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.5px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: "40px" }}><div className="spinner-border spinner-border-sm text-primary" /></td></tr>
              ) : filteredLessons.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>No lessons found.</td></tr>
              ) : filteredLessons.map((lesson) => {
                const { bg, color } = diffBadge(lesson.difficulty);
                return (
                  <tr key={lesson.id} style={{ borderTop: "1px solid #f1f5f9", transition: "background 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 600, fontSize: "13px", color: "#111827" }}>{lesson.title}</div>
                      <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "1px" }}>{lesson.id}</div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "12px", color: "#6b7280" }}>{lesson.category_title}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ background: bg, color, fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px" }}>{lesson.difficulty || "Beginner"}</span>
                    </td>
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "#f59e0b", fontSize: "13px" }}>{lesson.xp_reward || 50} XP</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ background: "#f1f5f9", color: "#374151", fontSize: "11px", padding: "3px 8px", borderRadius: "6px" }}>{(lesson.mcq_quiz || []).length}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ background: "#f1f5f9", color: "#374151", fontSize: "11px", padding: "3px 8px", borderRadius: "6px" }}>{(lesson.coding_challenges || []).length}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        <button onClick={() => handleOpenModal(lesson)} style={{ padding: "6px 8px", background: "#eef2ff", border: "none", borderRadius: "8px", cursor: "pointer", color: "#6366f1", display: "flex", alignItems: "center" }}><Edit size={14} /></button>
                        <button onClick={() => handleDelete(lesson.id)} style={{ padding: "6px 8px", background: "#fef2f2", border: "none", borderRadius: "8px", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center" }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Modal */}
      {showAIModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", width: "450px", padding: "30px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sparkles size={20} style={{ color: "#6366f1" }} /> Auto-Generate with AI
                </h2>
                <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0, marginTop: "2px" }}>Generate a complete curriculum module instantly</p>
              </div>
              <button onClick={() => setShowAIModal(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer" }}><X size={16} /></button>
            </div>

            <form onSubmit={handleAIGenerate}>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Generation Topic</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. List Comprehensions, Decorators..."
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  required
                  disabled={generating}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Difficulty Level</label>
                <select
                  style={inputStyle}
                  value={aiDifficulty}
                  onChange={e => setAiDifficulty(e.target.value)}
                  disabled={generating}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowAIModal(false)}
                  disabled={generating}
                  style={{ flex: 1, padding: "12px", border: "1.5px solid #e5e7eb", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", background: "transparent", color: "#6b7280" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  style={{ flex: 2, padding: "12px", background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 12px rgba(99,102,241,0.4)" }}
                >
                  {generating ? "Generating..." : "Generate Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", width: "85vw", maxHeight: "90vh", overflowY: "auto", padding: "36px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>{editLesson ? "Edit Lesson" : "Create New Lesson"}</h2>
                <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0, marginTop: "4px" }}>Fill in all relevant fields for this lesson</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: "10px", padding: "8px", cursor: "pointer" }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Lesson ID</label>
                  <input style={inputStyle} value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} disabled={!!editLesson} required />
                </div>
                <div>
                  <label style={labelStyle}>Title</label>
                  <input style={inputStyle} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div>
                  <label style={labelStyle}>Category Title</label>
                  <input style={inputStyle} value={formData.category_title} onChange={e => setFormData({ ...formData, category_title: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Category ID</label>
                  <input style={inputStyle} value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} placeholder="e.g. fundamentals" />
                </div>
                <div>
                  <label style={labelStyle}>Difficulty</label>
                  <select style={inputStyle} value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })}>
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>XP Reward</label>
                  <input type="number" style={inputStyle} value={formData.xp_reward} onChange={e => setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 50 })} min="0" />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "60px" }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Theory Content</label>
                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "200px", fontFamily: "monospace", fontSize: "12px", lineHeight: 1.6 }} value={formData.theory} onChange={e => setFormData({ ...formData, theory: e.target.value })} />
              </div>

              {/* Code Examples */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <label style={labelStyle}>Code Examples</label>
                  <button type="button" onClick={() => addArrayItem("code_examples", { title: "", code: "", output: "" })}
                    style={{ fontSize: "12px", color: "#6366f1", background: "#eef2ff", border: "none", borderRadius: "8px", padding: "5px 12px", cursor: "pointer", fontWeight: 600 }}>
                    + Add
                  </button>
                </div>
                {formData.code_examples.map((ex, i) => (
                  <div key={i} style={{ background: "#f8fafc", borderRadius: "12px", padding: "16px", marginBottom: "10px", position: "relative" }}>
                    <button type="button" onClick={() => removeArrayItem("code_examples", i)}
                      style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}><Trash size={14} /></button>
                    <input type="text" placeholder="Example title" value={ex.title || ""} onChange={e => { const u = [...formData.code_examples]; u[i] = { ...u[i], title: e.target.value }; setFormData({ ...formData, code_examples: u }); }}
                      style={{ ...inputStyle, marginBottom: "8px", fontWeight: 600 }} />
                    <textarea placeholder="Python code..." value={ex.code || ""} onChange={e => { const u = [...formData.code_examples]; u[i] = { ...u[i], code: e.target.value }; setFormData({ ...formData, code_examples: u }); }}
                      style={{ ...inputStyle, fontFamily: "monospace", fontSize: "12px", minHeight: "80px", marginBottom: "8px", resize: "vertical", background: "#1e293b", color: "#38bdf8", border: "none" }} />
                    <input type="text" placeholder="Expected output" value={ex.output || ""} onChange={e => { const u = [...formData.code_examples]; u[i] = { ...u[i], output: e.target.value }; setFormData({ ...formData, code_examples: u }); }}
                      style={inputStyle} />
                  </div>
                ))}
              </div>

              <button type="submit" disabled={saving}
                style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 12px rgba(99,102,241,0.4)" }}>
                {saving ? <div className="spinner-border spinner-border-sm" /> : <Save size={18} />}
                {saving ? "Saving..." : "Save Lesson"}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminLessons;
