import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { Toast, useToast } from "../../components/Toast";
import { Plus, Edit, Trash2, Code2, Save, X, Lightbulb } from "lucide-react";

const inputStyle = {
  width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb",
  borderRadius: "10px", fontSize: "13px", outline: "none",
  transition: "border-color 0.2s", fontFamily: "inherit", boxSizing: "border-box",
};
const labelStyle = {
  display: "block", fontSize: "12px", fontWeight: 600, color: "#374151",
  marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px",
};

function AdminChallenges() {
  const { toasts, addToast, removeToast } = useToast();
  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({ title: "", task: "", initial_code: "", expected_output: "", hints: [""] });

  useEffect(() => {
    fetch("http://127.0.0.1:8000/lessons?username=admin@lms.com")
      .then(r => r.json())
      .then(data => {
        const flat = [];
        data.forEach(cat => cat.lessons.forEach(l => flat.push(l)));
        setLessons(flat);
        if (flat.length > 0) setSelectedLessonId(flat[0].id);
      });
  }, []);

  useEffect(() => { if (selectedLessonId) fetchChallenges(); }, [selectedLessonId]);

  const fetchChallenges = () => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/lessons/${selectedLessonId}?username=admin@lms.com`)
      .then(r => r.json())
      .then(d => { setChallenges(d.coding_challenges || []); setLoading(false); });
  };

  const handleOpenModal = (index = null) => {
    if (index !== null) {
      setEditIndex(index);
      setFormData({ ...challenges[index], hints: challenges[index].hints || [""] });
    } else {
      setEditIndex(null);
      setFormData({ title: "", task: "", initial_code: "", expected_output: "", hints: [""] });
    }
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    let updated = [...challenges];
    if (editIndex !== null) updated[editIndex] = formData;
    else updated.push(formData);
    fetch(`http://127.0.0.1:8000/admin/lessons/${selectedLessonId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coding_challenges: updated })
    }).then(() => {
      setShowModal(false); fetchChallenges();
      addToast(editIndex !== null ? "Challenge updated!" : "Challenge added!", "success");
    });
  };

  const handleDelete = (index) => {
    if (window.confirm("Delete this challenge?")) {
      const updated = challenges.filter((_, i) => i !== index);
      fetch(`http://127.0.0.1:8000/admin/lessons/${selectedLessonId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coding_challenges: updated })
      }).then(() => { fetchChallenges(); addToast("Challenge deleted.", "success"); });
    }
  };

  return (
    <AdminLayout>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Coding Challenges</h1>
          <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0, marginTop: "4px" }}>Set up interactive coding tasks and test cases</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(239,68,68,0.4)" }}
        >
          <Plus size={17} /> Add Challenge
        </button>
      </div>

      {/* Lesson Selector */}
      <div style={{ background: "#fff", borderRadius: "14px", padding: "20px 24px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: "16px" }}>
        <Code2 size={20} style={{ color: "#ef4444", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <label style={{ ...labelStyle, marginBottom: "8px" }}>Select Lesson</label>
          <select style={{ ...inputStyle, width: "auto", minWidth: "300px" }} value={selectedLessonId} onChange={e => setSelectedLessonId(e.target.value)}>
            {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </div>
        <div style={{ background: "#fef2f2", color: "#ef4444", fontWeight: 700, fontSize: "14px", padding: "10px 20px", borderRadius: "10px" }}>
          {challenges.length} Challenges
        </div>
      </div>

      {/* Challenges List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}><div className="spinner-border text-danger" /></div>
      ) : challenges.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "16px" }}>
          <Code2 size={56} style={{ color: "#d1d5db", marginBottom: "12px" }} />
          <h3 style={{ color: "#9ca3af", fontWeight: 500 }}>No challenges configured yet.</h3>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {challenges.map((c, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.04)", transition: "box-shadow 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <span style={{ background: "#fef2f2", color: "#ef4444", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", marginBottom: "6px", display: "inline-block" }}>CHALLENGE #{i + 1}</span>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>{c.title}</h3>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => handleOpenModal(i)} style={{ padding: "7px 9px", background: "#eef2ff", border: "none", borderRadius: "8px", cursor: "pointer", color: "#6366f1", display: "flex", alignItems: "center" }}><Edit size={14} /></button>
                  <button onClick={() => handleDelete(i)} style={{ padding: "7px 9px", background: "#fef2f2", border: "none", borderRadius: "8px", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center" }}><Trash2 size={14} /></button>
                </div>
              </div>
              <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "12px", lineHeight: 1.5 }}>{c.task}</p>
              {c.initial_code && (
                <div style={{ background: "#0f172a", borderRadius: "10px", padding: "14px 16px", fontFamily: "monospace", fontSize: "12px", color: "#38bdf8", lineHeight: 1.6 }}>
                  {c.initial_code}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", width: "600px", maxHeight: "90vh", overflowY: "auto", padding: "32px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Coding Challenge</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: "10px", padding: "8px", cursor: "pointer" }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Task Title</label>
                <input type="text" style={inputStyle} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Challenge Instructions</label>
                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }} value={formData.task} onChange={e => setFormData({ ...formData, task: e.target.value })} required />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Starter Code (Python)</label>
                <textarea style={{ ...inputStyle, fontFamily: "monospace", background: "#0f172a", color: "#38bdf8", border: "none", resize: "vertical", minHeight: "100px", fontSize: "12px" }} value={formData.initial_code} onChange={e => setFormData({ ...formData, initial_code: e.target.value })} />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Expected Output</label>
                <input type="text" style={inputStyle} value={formData.expected_output} onChange={e => setFormData({ ...formData, expected_output: e.target.value })} required />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "6px" }}><Lightbulb size={14} style={{ color: "#f59e0b" }} /> Hints</label>
                {formData.hints.map((h, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                    <input type="text" style={inputStyle} value={h} onChange={e => { const u = [...formData.hints]; u[i] = e.target.value; setFormData({ ...formData, hints: u }); }} placeholder={`Hint ${i + 1}`} />
                    <button type="button" onClick={() => setFormData({ ...formData, hints: formData.hints.filter((_, idx) => idx !== i) })}
                      style={{ padding: "8px", background: "#fef2f2", border: "none", borderRadius: "8px", cursor: "pointer", color: "#ef4444", flexShrink: 0 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => setFormData({ ...formData, hints: [...formData.hints, ""] })}
                  style={{ fontSize: "12px", color: "#6366f1", background: "#eef2ff", border: "none", borderRadius: "8px", padding: "5px 12px", cursor: "pointer", fontWeight: 600 }}>
                  + Add Hint
                </button>
              </div>
              <button type="submit" style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 12px rgba(239,68,68,0.4)" }}>
                <Save size={16} /> Save Challenge
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminChallenges;
