import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { Toast, useToast } from "../../components/Toast";
import { Plus, Edit, Trash2, HelpCircle, Save, X, Sparkles, BookOpen } from "lucide-react";

const inputStyle = {
  width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb",
  borderRadius: "10px", fontSize: "13px", outline: "none",
  transition: "border-color 0.2s", fontFamily: "inherit", boxSizing: "border-box",
};
const labelStyle = {
  display: "block", fontSize: "12px", fontWeight: 600, color: "#374151",
  marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px",
};

function AdminQuestions() {
  const { toasts, addToast, removeToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({ question: "", options: ["", "", "", ""], answer: "", explanation: "" });
  const [generating, setGenerating] = useState(false);

  // 1. Fetch all courses on mount
  useEffect(() => {
    fetch("http://127.0.0.1:8000/admin/courses")
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d) && d.length > 0) {
          setCourses(d);
          setSelectedCourseId(d[0].id);
        }
      })
      .catch(err => console.error("Error loading courses:", err));
  }, []);

  // 2. When selected course changes: reset lesson & questions, fetch lessons for this course only
  useEffect(() => {
    if (!selectedCourseId) return;

    setSelectedLessonId("");
    setQuestions([]);
    setLessons([]);

    fetch(`http://127.0.0.1:8000/admin/lessons?course_id=${selectedCourseId}`)
      .then(r => r.json())
      .then(d => {
        const courseLessons = Array.isArray(d) ? d : [];
        setLessons(courseLessons);
        if (courseLessons.length > 0) {
          setSelectedLessonId(courseLessons[0].id);
        }
      })
      .catch(err => console.error("Error loading lessons for course:", err));
  }, [selectedCourseId]);

  // 3. When selected lesson changes: fetch MCQs for this lesson only
  useEffect(() => {
    if (!selectedLessonId) {
      setQuestions([]);
      return;
    }
    fetchQuestions();
  }, [selectedLessonId]);

  const fetchQuestions = () => {
    if (!selectedLessonId) return;
    setLoading(true);
    fetch(`http://127.0.0.1:8000/lessons/${selectedLessonId}?username=admin@lms.com`)
      .then(r => r.json())
      .then(d => { 
        setQuestions(d.mcq_quiz || []); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  };

  const handleAIGenerateMCQ = () => {
    if (!selectedLessonId || !selectedCourseId) return;
    const currentLesson = lessons.find(l => l.id === selectedLessonId);
    const targetTopic = currentLesson ? currentLesson.title : "Lesson Concepts";
    const targetDiff = currentLesson ? currentLesson.difficulty : "Beginner";
    
    setGenerating(true);
    fetch("http://127.0.0.1:8000/admin/ai/generate-mcq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: targetTopic,
        difficulty: targetDiff,
        number_of_questions: 5,
        lesson_id: selectedLessonId,
        course_id: selectedCourseId
      })
    })
      .then(r => {
        if (!r.ok) throw new Error("Failed to generate MCQs");
        return r.json();
      })
      .then(() => {
        setGenerating(false);
        fetchQuestions();
        addToast("5 MCQs generated successfully with AI!", "success");
      })
      .catch(err => {
        setGenerating(false);
        addToast("Error: " + err.message, "error");
      });
  };

  const handleOpenModal = (index = null) => {
    if (index !== null) {
      setEditIndex(index);
      setFormData({ ...questions[index] });
    } else {
      setEditIndex(null);
      setFormData({ question: "", options: ["", "", "", ""], answer: "", explanation: "" });
    }
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedLessonId) return;
    let updated = [...questions];
    if (editIndex !== null) updated[editIndex] = formData;
    else updated.push(formData);

    fetch(`http://127.0.0.1:8000/admin/lessons/${selectedLessonId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mcq_quiz: updated })
    }).then(() => {
      setShowModal(false);
      fetchQuestions();
      addToast(editIndex !== null ? "Question updated!" : "Question added!", "success");
    });
  };

  const handleDelete = (index) => {
    if (!selectedLessonId) return;
    if (window.confirm("Delete this question?")) {
      const updated = questions.filter((_, i) => i !== index);
      fetch(`http://127.0.0.1:8000/admin/lessons/${selectedLessonId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mcq_quiz: updated })
      }).then(() => { fetchQuestions(); addToast("Question deleted.", "success"); });
    }
  };

  return (
    <AdminLayout>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0 }}>MCQ Questions</h1>
          <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0, marginTop: "4px" }}>Manage quiz questions by course and lesson</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleAIGenerateMCQ}
            disabled={!selectedLessonId || generating}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(168,85,247,0.4)", opacity: (!selectedLessonId || generating) ? 0.6 : 1 }}
          >
            <Sparkles size={17} /> {generating ? "Generating..." : "AI Generate"}
          </button>
          <button
            onClick={() => handleOpenModal()}
            disabled={!selectedLessonId || generating}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(245,158,11,0.4)", opacity: (!selectedLessonId || generating) ? 0.6 : 1 }}
          >
            <Plus size={17} /> Add MCQ
          </button>
        </div>
      </div>

      {/* Hierarchical Filter: Course Selector & Lesson Selector */}
      <div style={{ background: "#fff", borderRadius: "14px", padding: "20px 24px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
        
        {/* Course Selector */}
        <div style={{ minWidth: "240px" }}>
          <label style={{ ...labelStyle, marginBottom: "8px" }}>Select Course</label>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BookOpen size={18} style={{ color: "#4f46e5", flexShrink: 0 }} />
            <select
              style={{ ...inputStyle, fontWeight: 600, color: "#0f172a" }}
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lesson Selector */}
        <div style={{ flex: 1, minWidth: "280px" }}>
          <label style={{ ...labelStyle, marginBottom: "8px" }}>Select Lesson</label>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <HelpCircle size={18} style={{ color: "#f59e0b", flexShrink: 0 }} />
            <select
              style={{ ...inputStyle, width: "100%", color: lessons.length === 0 ? "#9ca3af" : "#0f172a" }}
              value={selectedLessonId}
              onChange={e => setSelectedLessonId(e.target.value)}
              disabled={lessons.length === 0}
            >
              {lessons.length === 0 ? (
                <option value="">No lessons available for this course yet</option>
              ) : (
                lessons.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))
              )}
            </select>
          </div>
        </div>

        <div style={{ background: "#fffbeb", color: "#d97706", fontWeight: 700, fontSize: "14px", padding: "10px 20px", borderRadius: "10px", alignSelf: "flex-end" }}>
          {questions.length} Questions
        </div>
      </div>

      {/* Questions Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}><div className="spinner-border text-warning" /></div>
      ) : lessons.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "16px" }}>
          <BookOpen size={56} style={{ color: "#d1d5db", marginBottom: "12px" }} />
          <h3 style={{ color: "#9ca3af", fontWeight: 500, fontSize: "16px" }}>No lessons available for this course yet.</h3>
          <p style={{ color: "#cbd5e1", fontSize: "13px" }}>Create or generate lessons for this course to manage MCQs.</p>
        </div>
      ) : questions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "16px" }}>
          <HelpCircle size={56} style={{ color: "#d1d5db", marginBottom: "12px" }} />
          <h3 style={{ color: "#9ca3af", fontWeight: 500, fontSize: "16px" }}>No MCQs for this lesson yet.</h3>
          <p style={{ color: "#cbd5e1", fontSize: "13px" }}>Click "AI Generate" or "Add MCQ" above to add quiz questions.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {questions.map((q, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.04)", transition: "box-shadow 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{ background: "#111827", color: "#fff", fontWeight: 700, fontSize: "11px", width: "22px", height: "22px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => handleOpenModal(i)} style={{ padding: "5px 7px", background: "#eef2ff", border: "none", borderRadius: "7px", cursor: "pointer", color: "#6366f1" }}><Edit size={13} /></button>
                  <button onClick={() => handleDelete(i)} style={{ padding: "5px 7px", background: "#fef2f2", border: "none", borderRadius: "7px", cursor: "pointer", color: "#ef4444" }}><Trash2 size={13} /></button>
                </div>
              </div>
              <p style={{ fontWeight: 600, fontSize: "13px", color: "#0f172a", marginBottom: "12px", lineHeight: 1.5 }}>{q.question}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {(q.options || []).map((opt, j) => (
                  <div key={j} style={{
                    padding: "8px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: opt === q.answer ? 600 : 400,
                    background: opt === q.answer ? "#ecfdf5" : "#f8fafc",
                    color: opt === q.answer ? "#059669" : "#6b7280",
                    border: opt === q.answer ? "1px solid #6ee7b7" : "1px solid #f1f5f9",
                  }}>
                    {opt === q.answer ? "✓ " : ""}{opt}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", width: "540px", maxHeight: "90vh", overflowY: "auto", padding: "32px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>{editIndex !== null ? "Edit Question" : "New MCQ Question"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: "10px", padding: "8px", cursor: "pointer" }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Question Text</label>
                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }} value={formData.question} onChange={e => setFormData({ ...formData, question: e.target.value })} required />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Options</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {formData.options.map((opt, i) => (
                    <input key={i} type="text" style={{ ...inputStyle, borderColor: formData.answer === opt && opt ? "#6ee7b7" : "#e5e7eb", background: formData.answer === opt && opt ? "#ecfdf5" : "#fff" }}
                      placeholder={`Option ${i + 1}`} value={opt}
                      onChange={e => { const u = [...formData.options]; u[i] = e.target.value; setFormData({ ...formData, options: u }); }}
                      required />
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Correct Answer</label>
                <select style={inputStyle} value={formData.answer} onChange={e => setFormData({ ...formData, answer: e.target.value })} required>
                  <option value="">Select correct option...</option>
                  {formData.options.map((opt, i) => opt && <option key={i} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Explanation</label>
                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "60px" }} value={formData.explanation} onChange={e => setFormData({ ...formData, explanation: e.target.value })} />
              </div>
              <button type="submit" style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <Save size={16} /> Save Question
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminQuestions;

