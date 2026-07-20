import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { Toast, useToast } from "../../components/Toast";
import { Plus, Edit, Trash2, Save, X, MessageSquare, List } from "lucide-react";

const inputStyle = {
  width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb",
  borderRadius: "10px", fontSize: "13px", outline: "none",
  transition: "border-color 0.2s", fontFamily: "inherit", boxSizing: "border-box",
};
const labelStyle = {
  display: "block", fontSize: "12px", fontWeight: 600, color: "#374151",
  marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px",
};

function AdminInterview() {
  const { toasts, addToast, removeToast } = useToast();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  
  const [formData, setFormData] = useState({ 
    id: "", category: "Beginner", question: "", ideal_answer: "", 
    keywords: [""], points: [""] 
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/admin/interview-questions")
      .then(r => r.json())
      .then(d => { setQuestions(d || []); setLoading(false); })
      .catch(() => { setLoading(false); addToast("Failed to fetch", "error") });
  };

  const handleOpenModal = (index = null) => {
    if (index !== null) {
      setEditIndex(index);
      setFormData({ 
        ...questions[index], 
        keywords: questions[index].keywords || [""], 
        points: questions[index].points || [""] 
      });
    } else {
      setEditIndex(null);
      setFormData({ 
        id: `int_${Date.now()}`, category: "Beginner", question: "", ideal_answer: "", 
        keywords: [""], points: [""] 
      });
    }
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Process form data
    const payload = {
        ...formData,
        keywords: formData.keywords.filter(k => k.trim() !== ""),
        points: formData.points.filter(p => p.trim() !== "")
    };

    if (editIndex !== null) {
      // Update existing
      fetch(`http://127.0.0.1:8000/admin/interview-questions/${payload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then((res) => {
          if (!res.ok) throw new Error("Failed");
          setShowModal(false); fetchQuestions();
          addToast("Interview question updated!", "success");
      }).catch(() => addToast("Failed to update question", "error"));
    } else {
      // Add new
      fetch("http://127.0.0.1:8000/admin/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then((res) => {
          if (!res.ok) throw new Error("Failed");
          setShowModal(false); fetchQuestions();
          addToast("Interview question added!", "success");
      }).catch(() => addToast("Failed to add question", "error"));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this question?")) {
      fetch(`http://127.0.0.1:8000/admin/interview-questions/${id}`, {
        method: "DELETE"
      }).then((res) => { 
          if (!res.ok) throw new Error("Failed");
          fetchQuestions(); addToast("Question deleted.", "success"); 
      }).catch(() => addToast("Failed to delete question", "error"));
    }
  };

  const getCategoryColor = (cat) => {
    if (cat === "Beginner") return { bg: "#ecfdf5", color: "#10b981", border: "#a7f3d0" };
    if (cat === "Intermediate") return { bg: "#fffbeb", color: "#f59e0b", border: "#fde68a" };
    if (cat === "Advanced") return { bg: "#fef2f2", color: "#ef4444", border: "#fecaca" };
    return { bg: "#e0e7ff", color: "#4f46e5", border: "#c7d2fe" };
  };

  return (
    <AdminLayout>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Interview Questions</h1>
          <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0, marginTop: "4px" }}>Manage question bank for the mock interview simulator</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "linear-gradient(135deg,#0ea5e9,#0284c7)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(14,165,233,0.4)" }}
        >
          <Plus size={17} /> Add Question
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: "14px", padding: "20px 24px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
         <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
             <MessageSquare size={20} style={{ color: "#0ea5e9" }} />
             <span style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Total Database Questions</span>
         </div>
         <div style={{ background: "#f0f9ff", color: "#0ea5e9", fontWeight: 700, fontSize: "14px", padding: "10px 20px", borderRadius: "10px" }}>
            {questions.length} Questions
         </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}><div className="spinner-border text-info" /></div>
      ) : questions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "16px" }}>
           <List size={56} style={{ color: "#d1d5db", marginBottom: "12px" }} />
           <h3 style={{ color: "#9ca3af", fontWeight: 500 }}>No interview questions configured yet.</h3>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {questions.map((q, i) => {
            const catStyles = getCategoryColor(q.category);
            return (
              <div key={q.id} style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.04)" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                   <div>
                      <span style={{ background: catStyles.bg, color: catStyles.color, border: `1px solid ${catStyles.border}`, fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", display: "inline-block", marginBottom: "8px" }}>
                          {q.category.toUpperCase()}
                      </span>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.4 }}>{q.question}</h3>
                   </div>
                   <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => handleOpenModal(i)} style={{ padding: "7px 9px", background: "#eef2ff", border: "none", borderRadius: "8px", cursor: "pointer", color: "#6366f1", display: "flex", alignItems: "center" }}><Edit size={14} /></button>
                      <button onClick={() => handleDelete(q.id)} style={{ padding: "7px 9px", background: "#fef2f2", border: "none", borderRadius: "8px", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center" }}><Trash2 size={14} /></button>
                   </div>
                 </div>
                 
                 <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #f1f5f9", marginBottom: "12px" }}>
                     <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "4px" }}>IDEAL ANSWER:</div>
                     <div style={{ fontSize: "13px", color: "#334155", lineHeight: 1.5 }}>
                        {q.ideal_answer}
                     </div>
                 </div>

                 <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>KEYWORDS:</div>
                    {(q.keywords || []).map((kw, ki) => (
                       <span key={ki} style={{ fontSize: "11px", background: "#f1f5f9", padding: "2px 8px", borderRadius: "10px", color: "#475569" }}>{kw}</span>
                    ))}
                 </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", width: "600px", maxHeight: "90vh", overflowY: "auto", padding: "32px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>{editIndex !== null ? "Edit Interview Question" : "New Interview Question"}</h2>
              <button type="button" onClick={() => setShowModal(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: "10px", padding: "8px", cursor: "pointer" }}><X size={16} /></button>
            </div>
            
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Category (Difficulty level or Topic)</label>
                <select style={inputStyle} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="System Design">System Design</option>
                  <option value="Behavioral">Behavioral</option>
                </select>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Question Text</label>
                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "60px" }} value={formData.question} onChange={e => setFormData({ ...formData, question: e.target.value })} required />
              </div>
              
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Ideal Answer</label>
                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "100px" }} value={formData.ideal_answer} onChange={e => setFormData({ ...formData, ideal_answer: e.target.value })} required />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Evaluation Keywords</label>
                <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "6px", marginTop: "-4px" }}>If user hits these keywords, their score goes up.</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                   {formData.keywords.map((kw, i) => (
                      <input key={i} type="text" style={{ ...inputStyle, width: "120px", display: "inline-block", padding: "6px 10px" }} value={kw} onChange={e => { const u = [...formData.keywords]; u[i] = e.target.value; setFormData({...formData, keywords: u}); }} placeholder="Keyword" />
                   ))}
                   <button type="button" onClick={() => setFormData({...formData, keywords: [...formData.keywords, ""]})} style={{ padding: "6px 12px", background: "#f1f5f9", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>+ Add</button>
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Missing Output Points</label>
                <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "6px", marginTop: "-4px" }}>Points returned to user if they fail the keyword evaluation.</p>
                {formData.points.map((pt, i) => (
                   <input key={i} type="text" style={{ ...inputStyle, marginBottom: "8px" }} value={pt} onChange={e => { const u = [...formData.points]; u[i] = e.target.value; setFormData({...formData, points: u}); }} placeholder="e.g. Explain how decorators wrap functions" />
                ))}
                <button type="button" onClick={() => setFormData({...formData, points: [...formData.points, ""]})} style={{ padding: "6px 12px", background: "#f1f5f9", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>+ Add Point</button>
              </div>

              <button type="submit" style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#0ea5e9,#0284c7)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 12px rgba(14,165,233,0.4)" }}>
                <Save size={16} /> Save Question
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminInterview;
