import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { Toast, useToast } from "../../components/Toast";
import { Plus, Edit, Trash2, FileCode, Save, X, Sparkles, BookOpen, Layers } from "lucide-react";
import { API_BASE } from "../../config";

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
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [lessons, setLessons] = useState([]);
  const [selectedLessonFilter, setSelectedLessonFilter] = useState("");
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editExercise, setEditExercise] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiLessonId, setAiLessonId] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState("Beginner");
  const [generatingAI, setGeneratingAI] = useState(false);

  // 1. Fetch courses on mount
  useEffect(() => {
    fetch(API_BASE + "/admin/courses")
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d) && d.length > 0) {
          setCourses(d);
          setSelectedCourseId(d[0].id);
        }
      })
      .catch(err => console.error("Error loading courses:", err));
  }, []);

  // 2. When selected course changes: reset lessons, lesson filter & exercises
  useEffect(() => {
    if (!selectedCourseId) return;

    setSelectedLessonFilter("");
    setExercises([]);
    setLessons([]);

    // Fetch lessons for this course only
    fetch(`${API_BASE}/admin/lessons?course_id=${selectedCourseId}`)
      .then(r => r.json())
      .then(d => {
        setLessons(Array.isArray(d) ? d : []);
      })
      .catch(err => console.error("Error loading lessons for course:", err));

    // Fetch exercises for this course only
    fetchExercises(selectedCourseId, "");
  }, [selectedCourseId]);

  // 3. When lesson filter changes: fetch exercises filtered by that lesson
  useEffect(() => {
    if (selectedCourseId) {
      fetchExercises(selectedCourseId, selectedLessonFilter);
    }
  }, [selectedLessonFilter]);

  const fetchExercises = (courseId = selectedCourseId, lessonId = selectedLessonFilter) => {
    if (!courseId) return;
    setLoading(true);
    let url = `${API_BASE}/admin/exercises?course_id=${courseId}`;
    if (lessonId) {
      url += `&lesson_id=${lessonId}`;
    }
    fetch(url)
      .then(r => r.json())
      .then(d => { 
        setExercises(Array.isArray(d) ? d : []); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  };

  const handleAIGenerate = (e) => {
    e.preventDefault();
    if (!aiLessonId) {
      addToast("Please select a lesson", "error");
      return;
    }
    const currentLesson = lessons.find(l => l.id === aiLessonId);
    const targetTopic = aiTopic || (currentLesson ? currentLesson.title : "Lesson Concepts");
    const targetDiff = aiDifficulty || (currentLesson ? currentLesson.difficulty : "Beginner");

    setGeneratingAI(true);
    fetch(API_BASE + "/admin/ai/generate-practice-exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: targetTopic,
        difficulty: targetDiff,
        number_of_exercises: 5,
        lesson_id: aiLessonId,
        course_id: selectedCourseId
      })
    })
      .then(r => {
        if (!r.ok) throw new Error("Failed to generate exercises");
        return r.json();
      })
      .then(() => {
        setGeneratingAI(false);
        setShowAIModal(false);
        fetchExercises();
        addToast("5 Practice Exercises generated successfully with AI!", "success");
      })
      .catch(err => {
        setGeneratingAI(false);
        addToast("Error: " + err.message, "error");
      });
  };

  const emptyForm = { id: "", lesson_id: "", title: "", type: "Output Prediction", question: "", code: "", expected_answer: "", hint: "", explanation: "", course_id: selectedCourseId };
  const [formData, setFormData] = useState(emptyForm);

  const handleOpenModal = (ex = null) => {
    if (ex) {
      setEditExercise(ex);
      setFormData({ ...emptyForm, ...ex, course_id: selectedCourseId });
    } else {
      setEditExercise(null);
      setFormData({ ...emptyForm, id: `ex_${Date.now()}`, lesson_id: lessons[0]?.id || "", course_id: selectedCourseId });
    }
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    const isEditing = editExercise !== null;
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${API_BASE}/admin/exercises/${editExercise.id}` : API_BASE + "/admin/exercises";
    const payload = { ...formData, course_id: selectedCourseId };

    fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(r => r.json())
      .then(() => {
        setShowModal(false); 
        setSaving(false); 
        fetchExercises();
        addToast(isEditing ? "Exercise updated!" : "Exercise created!", "success");
      })
      .catch(err => { setSaving(false); addToast("Error: " + err.message, "error"); });
  };

  const handleDelete = (exerciseId) => {
    if (window.confirm("Delete this exercise?")) {
      fetch(`${API_BASE}/admin/exercises/${exerciseId}`, { method: "DELETE" })
        .then(() => { fetchExercises(); addToast("Exercise deleted.", "success"); });
    }
  };

  const getLessonTitle = (id) => lessons.find(l => l.id === id)?.title || id;
  const currentCourse = courses.find(c => c.id === selectedCourseId);
  const techLabel = currentCourse ? currentCourse.technology : "Code";

  return (
    <AdminLayout>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Exercise Management</h1>
          <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0, marginTop: "4px" }}>Manage hands-on practice tasks for each lesson</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => {
              if (lessons.length === 0) {
                addToast("Please create or select lessons for this course first", "error");
                return;
              }
              setAiLessonId(lessons[0]?.id || "");
              setAiTopic(lessons[0]?.title || "");
              setAiDifficulty(lessons[0]?.difficulty || "Beginner");
              setShowAIModal(true);
            }}
            disabled={lessons.length === 0}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(168,85,247,0.4)", opacity: lessons.length === 0 ? 0.6 : 1 }}
          >
            <Sparkles size={17} /> AI Generate
          </button>
          <button
            onClick={() => handleOpenModal()}
            disabled={lessons.length === 0}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "linear-gradient(135deg,#0ea5e9,#0284c7)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(14,165,233,0.4)", opacity: lessons.length === 0 ? 0.6 : 1 }}
          >
            <Plus size={17} /> New Exercise
          </button>
        </div>
      </div>

      {/* Hierarchical Filter: Course Selector & Lesson Filter */}
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

        {/* Lesson Filter */}
        <div style={{ flex: 1, minWidth: "280px" }}>
          <label style={{ ...labelStyle, marginBottom: "8px" }}>Filter by Lesson</label>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Layers size={18} style={{ color: "#0ea5e9", flexShrink: 0 }} />
            <select
              style={{ ...inputStyle, width: "100%", color: lessons.length === 0 ? "#9ca3af" : "#0f172a" }}
              value={selectedLessonFilter}
              onChange={e => setSelectedLessonFilter(e.target.value)}
            >
              <option value="">All Lessons ({lessons.length})</option>
              {lessons.map(l => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ background: "#f0f9ff", color: "#0ea5e9", fontWeight: 700, fontSize: "14px", padding: "10px 20px", borderRadius: "10px", alignSelf: "flex-end" }}>
          {exercises.length} Exercises
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}><div className="spinner-border text-info" /></div>
      ) : lessons.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "16px" }}>
          <BookOpen size={56} style={{ color: "#d1d5db", marginBottom: "12px" }} />
          <h3 style={{ color: "#9ca3af", fontWeight: 500, fontSize: "16px" }}>No lessons available for this course yet.</h3>
          <p style={{ color: "#cbd5e1", fontSize: "13px" }}>Create or generate lessons for this course to manage practice exercises.</p>
        </div>
      ) : exercises.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "16px" }}>
          <FileCode size={56} style={{ color: "#d1d5db", marginBottom: "12px" }} />
          <h3 style={{ color: "#9ca3af", fontWeight: 500, fontSize: "16px" }}>No exercises available for this course yet.</h3>
          <p style={{ color: "#cbd5e1", fontSize: "13px" }}>Click "AI Generate" or "New Exercise" above to add practice tasks.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", margin: 0 }}>Exercises for {currentCourse?.name || "Selected Course"}</h3>
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
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>{editExercise ? "Edit Exercise" : "New Exercise"} ({techLabel})</h2>
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
                <label style={labelStyle}>{techLabel} Code (Optional)</label>
                <textarea 
                  style={{ ...inputStyle, resize: "vertical", minHeight: "100px", fontFamily: "monospace", backgroundColor: "#f8fafc", borderColor: "#cbd5e1" }} 
                  value={formData.code} 
                  onChange={e => setFormData({ ...formData, code: e.target.value })} 
                  placeholder={`# Write your ${techLabel} code template here`}
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

      {/* AI Generate Modal */}
      {showAIModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", width: "450px", padding: "30px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sparkles size={20} style={{ color: "#a855f7" }} /> AI Exercise Generator ({techLabel})
                </h2>
                <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0, marginTop: "2px" }}>Generate 5 practice exercises for a lesson in {techLabel}</p>
              </div>
              <button type="button" onClick={() => setShowAIModal(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer" }}><X size={16} /></button>
            </div>

            <form onSubmit={handleAIGenerate}>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Target Lesson</label>
                <select
                  style={inputStyle}
                  value={aiLessonId}
                  onChange={e => {
                    const lId = e.target.value;
                    setAiLessonId(lId);
                    const matching = lessons.find(l => l.id === lId);
                    if (matching) {
                      setAiTopic(matching.title || "");
                      setAiDifficulty(matching.difficulty || "Beginner");
                    }
                  }}
                  required
                  disabled={generatingAI}
                >
                  <option value="">Select lesson...</option>
                  {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Generation Topic</label>
                <input
                  style={inputStyle}
                  placeholder={`e.g. ${techLabel} Methods, Loops, Structures...`}
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  required
                  disabled={generatingAI}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Difficulty Level</label>
                <select
                  style={inputStyle}
                  value={aiDifficulty}
                  onChange={e => setAiDifficulty(e.target.value)}
                  disabled={generatingAI}
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
                  disabled={generatingAI}
                  style={{ flex: 1, padding: "12px", border: "1.5px solid #e5e7eb", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", background: "transparent", color: "#6b7280" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generatingAI}
                  style={{ flex: 2, padding: "12px", background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 12px rgba(168,85,247,0.3)" }}
                >
                  {generatingAI ? "Generating..." : "Generate Exercises"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminExercises;

