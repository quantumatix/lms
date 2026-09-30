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
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [saving, setSaving] = useState(false);

  const [selectedEnhanceLesson, setSelectedEnhanceLesson] = useState(null);
  const [enhancing, setEnhancing] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const handleEnhanceConfirm = (lesson) => {
    setSelectedEnhanceLesson(lesson);
  };

  const [showAIModal, setShowAIModal] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState("Beginner");
  const [aiCourseId, setAiCourseId] = useState("python-core");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/admin/courses")
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d) && d.length > 0) {
          setCourses(d);
          setSelectedCourseId(d[0].id);
          setAiCourseId(d[0].id);
        }
      })
      .catch(() => {});
  }, []);

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
      body: JSON.stringify({ 
        topic: aiTopic, 
        difficulty: aiDifficulty,
        course_id: aiCourseId || selectedCourseId || "python-core"
      })
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
        fetchLessons(selectedCourseId);
        addToast("Lesson generated successfully with AI!", "success");
      })
      .catch(err => {
        setGenerating(false);
        addToast("Error generating lesson: " + err.message, "error");
      });
  };

  const executeAIEnhance = () => {
    if (!selectedEnhanceLesson) return;
    const targetId = selectedEnhanceLesson.id;
    setSelectedEnhanceLesson(null);
    setEnhancing(true);

    fetch(`http://127.0.0.1:8000/admin/lessons/${targetId}/enhance`, {
      method: "POST"
    })
      .then(r => {
        if (!r.ok) throw new Error("Failed to enhance lesson via OpenAI");
        return r.json();
      })
      .then(() => {
        setEnhancing(false);
        fetchLessons();
        addToast("Lesson enhanced successfully with OpenAI!", "success");
      })
      .catch(err => {
        setEnhancing(false);
        addToast("Error enhancing lesson: " + err.message, "error");
      });
  };

  const emptyForm = {
    id: "", course_id: "python-core", title: "", category_id: "fundamentals", category_title: "Fundamentals",
    description: "", theory: "", xp_reward: 100, difficulty: "Beginner",
    code_examples: [], common_mistakes: [], best_practices: [], summary: "",
    real_world_examples: [], practice_questions: [], mcq_quiz: [], coding_challenges: []
  };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => { 
    fetchLessons(selectedCourseId); 
  }, [selectedCourseId]);

  const fetchLessons = (courseId = selectedCourseId) => {
    setLoading(true);
    const param = courseId ? `?course_id=${courseId}` : "";
    fetch(`http://127.0.0.1:8000/admin/lessons${param}`)
      .then(r => r.json())
      .then(d => { setLessons(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleOpenModal = (lesson = null) => {
    setActiveTab("general");
    if (lesson) {
      setEditLesson(lesson);
      fetch(`http://127.0.0.1:8000/lessons/${lesson.id}?username=admin@lms.com`)
        .then(r => r.json())
        .then(detail => {
          setFormData({
            id: detail.id || "",
            course_id: detail.course_id || lesson.course_id || selectedCourseId || "python-core",
            title: detail.title || "",
            category_id: detail.category_id || "",
            category_title: detail.category_title || "",
            description: detail.description || "",
            theory: detail.theory || "",
            xp_reward: detail.xp_reward || 100,
            difficulty: detail.difficulty || "Beginner",
            code_examples: detail.code_examples || [],
            common_mistakes: detail.common_mistakes || [],
            best_practices: detail.best_practices || [],
            summary: detail.summary || "",
            real_world_examples: detail.real_world_examples || detail.real_world_use_cases || [],
            practice_questions: detail.practice_questions || [],
            practice_exercises: detail.practice_exercises || [],
            mcq_quiz: detail.mcq_quiz || [],
            coding_challenges: detail.coding_challenges || []
          });
          setShowModal(true);
        });
    } else {
      setEditLesson(null);
      const activeCourse = courses.find(c => c.id === selectedCourseId);
      setFormData({ 
        ...emptyForm, 
        id: `lesson_${Date.now()}`,
        course_id: selectedCourseId || (courses[0]?.id || "python-core"),
        category_title: activeCourse ? `${activeCourse.name} Fundamentals` : "Fundamentals"
      });
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
    const payload = {
      ...formData,
      course_id: formData.course_id || selectedCourseId || "python-core"
    };
    fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(r => r.json())
      .then(() => {
        setShowModal(false); setSaving(false); fetchLessons(selectedCourseId);
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

  const addArrayItem = (field, template) => setFormData({ ...formData, [field]: [...(formData[field] || []), template] });
  const removeArrayItem = (field, index) => {
    const updated = [...(formData[field] || [])]; updated.splice(index, 1);
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
          <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0, marginTop: "4px" }}>Create and manage curriculum modules by course</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => {
              setAiCourseId(selectedCourseId || (courses[0]?.id || "python-core"));
              setShowAIModal(true);
            }}
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, maxWidth: "600px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", borderRadius: "10px", padding: "8px 14px", flex: 1 }}>
              <Search size={16} style={{ color: "#9ca3af" }} />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", width: "100%", color: "#374151" }}
              />
            </div>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              style={{
                padding: "8px 14px",
                border: "1.5px solid #e5e7eb",
                borderRadius: "10px",
                fontSize: "13px",
                outline: "none",
                fontWeight: 600,
                color: "#1e293b",
                backgroundColor: "#fff"
              }}
            >
              <option value="">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "50px", color: "#9ca3af" }}>
                    <BookOpen size={40} style={{ color: "#d1d5db", marginBottom: "10px", display: "inline-block" }} />
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "#64748b" }}>
                      No lessons available for this course yet.
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                      Use &ldquo;AI Auto-Generate&rdquo; or &ldquo;Add Lesson&rdquo; to add lessons to this course.
                    </div>
                  </td>
                </tr>
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
                        <button
                          onClick={() => handleEnhanceConfirm(lesson)}
                          title="AI Enhance"
                          style={{ padding: "6px 8px", background: "#f5f3ff", border: "none", borderRadius: "8px", cursor: "pointer", color: "#8b5cf6", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          <Sparkles size={14} />
                          <span style={{ fontSize: "11px", fontWeight: 600 }}>AI Enhance</span>
                        </button>
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

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* AI Enhancing Loading Overlay */}
      {enhancing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.8)", backdropFilter: "blur(8px)", zIndex: 3000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <div style={{ textAlign: "center", maxWidth: "450px", padding: "40px", background: "#1e293b", borderRadius: "24px", boxShadow: "0 25px 70px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ position: "relative", width: "90px", height: "90px", margin: "0 auto 28px" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "4px solid rgba(139,92,246,0.15)", borderTopColor: "#8b5cf6", animation: "spin 1.2s linear infinite" }} />
              <div style={{ position: "absolute", inset: "12px", borderRadius: "50%", border: "4px solid rgba(99,102,241,0.15)", borderBottomColor: "#6366f1", animation: "spin 2s linear infinite reverse" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#a78bfa" }}>
                <Sparkles size={36} />
              </div>
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "12px", background: "linear-gradient(135deg,#a78bfa,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Enhancing Lesson with OpenAI</h3>
            <p style={{ color: "#94a3b8", fontSize: "14px", fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
              Generating highly detailed theory content, 10+ code examples, 15 MCQs, 5 coding challenges, and real-world use cases...
            </p>
            <div style={{ marginTop: "24px", padding: "10px 18px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", fontSize: "12px", color: "#a78bfa", fontWeight: 600, border: "1px solid rgba(255,255,255,0.05)" }}>
              Please wait... This may take 20-40 seconds.
            </div>
          </div>
        </div>
      )}

      {/* AI Enhance Confirmation Dialog */}
      {selectedEnhanceLesson && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", width: "420px", padding: "28px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", gap: "14px", marginBottom: "20px" }}>
              <div style={{ background: "#f5f3ff", color: "#8b5cf6", borderRadius: "12px", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", height: "46px", width: "46px", flexShrink: 0 }}>
                <Sparkles size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Enhance with AI?</h4>
                <p style={{ color: "#4b5563", fontSize: "13px", margin: "6px 0 0", lineHeight: 1.5 }}>
                  This will completely regenerate the lesson content for <strong>"{selectedEnhanceLesson.title}"</strong> using OpenAI. Existing quizzes, exercises, and challenges for this lesson will be replaced.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setSelectedEnhanceLesson(null)}
                style={{ padding: "10px 16px", border: "1.5px solid #e5e7eb", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", background: "transparent", color: "#4b5563" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeAIEnhance}
                style={{ padding: "10px 20px", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(139,92,246,0.3)" }}
              >
                Yes, Enhance
              </button>
            </div>
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
                  <Sparkles size={20} style={{ color: "#8b5cf6" }} /> AI Lesson Generator
                </h2>
                <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0, marginTop: "2px" }}>Generate a complete curriculum module from a topic name</p>
              </div>
              <button onClick={() => setShowAIModal(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer" }}><X size={16} /></button>
            </div>

            <form onSubmit={handleAIGenerate}>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Target Course</label>
                <select
                  style={inputStyle}
                  value={aiCourseId}
                  onChange={e => setAiCourseId(e.target.value)}
                  disabled={generating}
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.technology})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Generation Topic</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Recursion, Binary Trees, Decorators..."
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
                  style={{ flex: 2, padding: "12px", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 12px rgba(139,92,246,0.3)" }}
                >
                  {generating ? "Generating..." : "Generate Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Admin Editor Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", width: "85vw", maxHeight: "90vh", overflowY: "auto", padding: "36px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>{editLesson ? "Edit Lesson" : "Create New Lesson"}</h2>
                <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0, marginTop: "4px" }}>Configure details, theory content, practice quizzes, and challenges</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: "10px", padding: "8px", cursor: "pointer" }}><X size={18} /></button>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "24px", overflowX: "auto", paddingBottom: "6px" }}>
              {[
                { id: "general", label: "1. General Details" },
                { id: "content", label: `2. Content & Examples (${formData.code_examples?.length || 0})` },
                { id: "mcqs", label: `3. MCQs Quiz (${formData.mcq_quiz?.length || 0})` },
                { id: "challenges", label: `4. Coding Challenges (${formData.coding_challenges?.length || 0})` },
                { id: "exercises", label: `5. Practice Exercises (${formData.practice_exercises?.length || 0})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "10px 18px",
                    background: activeTab === tab.id ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "#f8fafc",
                    color: activeTab === tab.id ? "#fff" : "#4b5563",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: activeTab === tab.id ? "0 4px 10px rgba(99,102,241,0.3)" : "none",
                    transition: "all 0.2s"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSave}>
              
              {/* Tab 1: General Details */}
              {activeTab === "general" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={labelStyle}>Target Course</label>
                      <select 
                        style={inputStyle} 
                        value={formData.course_id || selectedCourseId} 
                        onChange={e => setFormData({ ...formData, course_id: e.target.value })} 
                        required
                      >
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
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
                      <input type="number" style={inputStyle} value={formData.xp_reward || 100} onChange={e => setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 100 })} min="0" />
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={labelStyle}>Description</label>
                    <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "65px" }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={labelStyle}>Summary Key Takeaways</label>
                    <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "65px" }} value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} />
                  </div>
                </div>
              )}

              {/* Tab 2: Content & Examples */}
              {activeTab === "content" && (
                <div>
                  <div style={{ marginBottom: "24px" }}>
                    <label style={labelStyle}>Detailed Theory Content (Markdown format supported)</label>
                    <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "260px", fontFamily: "monospace", fontSize: "12px", lineHeight: 1.6 }} value={formData.theory} onChange={e => setFormData({ ...formData, theory: e.target.value })} />
                  </div>

                  {/* Code Examples */}
                  <div style={{ marginBottom: "28px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <label style={labelStyle}>Code Examples (At least 10 generated)</label>
                      <button type="button" onClick={() => addArrayItem("code_examples", { title: "", code: "", output: "", explanation: "", difficulty: "Beginner" })}
                        style={{ fontSize: "12px", color: "#6366f1", background: "#eef2ff", border: "none", borderRadius: "8px", padding: "5px 12px", cursor: "pointer", fontWeight: 600 }}>
                        + Add Example
                      </button>
                    </div>
                    {formData.code_examples.map((ex, i) => (
                      <div key={i} style={{ background: "#f8fafc", borderRadius: "12px", padding: "16px", marginBottom: "12px", position: "relative", border: "1px solid #f1f5f9" }}>
                        <button type="button" onClick={() => removeArrayItem("code_examples", i)}
                          style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}><Trash size={14} /></button>
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px", marginBottom: "8px" }}>
                          <input type="text" placeholder="Example title" value={ex.title || ""} onChange={e => { const u = [...formData.code_examples]; u[i] = { ...u[i], title: e.target.value }; setFormData({ ...formData, code_examples: u }); }} style={{ ...inputStyle, fontWeight: 600 }} />
                          <select value={ex.difficulty || "Beginner"} onChange={e => { const u = [...formData.code_examples]; u[i] = { ...u[i], difficulty: e.target.value }; setFormData({ ...formData, code_examples: u }); }} style={inputStyle}>
                            <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                          </select>
                        </div>
                        <textarea placeholder="Python code..." value={ex.code || ""} onChange={e => { const u = [...formData.code_examples]; u[i] = { ...u[i], code: e.target.value }; setFormData({ ...formData, code_examples: u }); }}
                          style={{ ...inputStyle, fontFamily: "monospace", fontSize: "12px", minHeight: "80px", marginBottom: "8px", resize: "vertical", background: "#1e293b", color: "#38bdf8", border: "none" }} />
                        <input type="text" placeholder="Expected output" value={ex.output || ""} onChange={e => { const u = [...formData.code_examples]; u[i] = { ...u[i], output: e.target.value }; setFormData({ ...formData, code_examples: u }); }} style={{ ...inputStyle, marginBottom: "8px" }} />
                        <input type="text" placeholder="Explanation" value={ex.explanation || ""} onChange={e => { const u = [...formData.code_examples]; u[i] = { ...u[i], explanation: e.target.value }; setFormData({ ...formData, code_examples: u }); }} style={inputStyle} />
                      </div>
                    ))}
                  </div>

                  {/* Real World Use Cases */}
                  <div style={{ marginBottom: "28px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <label style={labelStyle}>Real World Use Cases (At least 5 generated)</label>
                      <button type="button" onClick={() => addArrayItem("real_world_examples", { industry: "", use_case: "", solution_description: "", code_snippet: "" })}
                        style={{ fontSize: "12px", color: "#6366f1", background: "#eef2ff", border: "none", borderRadius: "8px", padding: "5px 12px", cursor: "pointer", fontWeight: 600 }}>
                        + Add Use Case
                      </button>
                    </div>
                    {(formData.real_world_examples || []).map((rw, i) => (
                      <div key={i} style={{ background: "#f8fafc", borderRadius: "12px", padding: "16px", marginBottom: "12px", position: "relative", border: "1px solid #f1f5f9" }}>
                        <button type="button" onClick={() => removeArrayItem("real_world_examples", i)}
                          style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}><Trash size={14} /></button>
                        <input type="text" placeholder="Industry (e.g. Banking)" value={rw.industry || ""} onChange={e => { const u = [...formData.real_world_examples]; u[i] = { ...u[i], industry: e.target.value }; setFormData({ ...formData, real_world_examples: u }); }} style={{ ...inputStyle, marginBottom: "8px", fontWeight: 600 }} />
                        <input type="text" placeholder="Use Case Statement" value={rw.use_case || ""} onChange={e => { const u = [...formData.real_world_examples]; u[i] = { ...u[i], use_case: e.target.value }; setFormData({ ...formData, real_world_examples: u }); }} style={{ ...inputStyle, marginBottom: "8px" }} />
                        <textarea placeholder="Solution description..." value={rw.solution_description || ""} onChange={e => { const u = [...formData.real_world_examples]; u[i] = { ...u[i], solution_description: e.target.value }; setFormData({ ...formData, real_world_examples: u }); }} style={{ ...inputStyle, marginBottom: "8px", minHeight: "50px" }} />
                        <textarea placeholder="Python snippet code..." value={rw.code_snippet || ""} onChange={e => { const u = [...formData.real_world_examples]; u[i] = { ...u[i], code_snippet: e.target.value }; setFormData({ ...formData, real_world_examples: u }); }} style={{ ...inputStyle, fontFamily: "monospace", fontSize: "11px", minHeight: "55px", background: "#f1f5f9" }} />
                      </div>
                    ))}
                  </div>

                  {/* Best Practices */}
                  <div style={{ marginBottom: "28px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <label style={labelStyle}>Best Practices Guidelines</label>
                      <button type="button" onClick={() => addArrayItem("best_practices", "")}
                        style={{ fontSize: "12px", color: "#6366f1", background: "#eef2ff", border: "none", borderRadius: "8px", padding: "5px 12px", cursor: "pointer", fontWeight: 600 }}>
                        + Add Guideline
                      </button>
                    </div>
                    {(formData.best_practices || []).map((bp, i) => (
                      <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                        <input type="text" value={bp || ""} onChange={e => { const u = [...formData.best_practices]; u[i] = e.target.value; setFormData({ ...formData, best_practices: u }); }} style={inputStyle} />
                        <button type="button" onClick={() => removeArrayItem("best_practices", i)} style={{ padding: "8px", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: "8px", cursor: "pointer" }}><Trash size={14} /></button>
                      </div>
                    ))}
                  </div>

                  {/* Common Mistakes */}
                  <div style={{ marginBottom: "28px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <label style={labelStyle}>Common Mistakes</label>
                      <button type="button" onClick={() => addArrayItem("common_mistakes", "")}
                        style={{ fontSize: "12px", color: "#6366f1", background: "#eef2ff", border: "none", borderRadius: "8px", padding: "5px 12px", cursor: "pointer", fontWeight: 600 }}>
                        + Add Warning
                      </button>
                    </div>
                    {(formData.common_mistakes || []).map((cm, i) => (
                      <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                        <input type="text" value={cm || ""} onChange={e => { const u = [...formData.common_mistakes]; u[i] = e.target.value; setFormData({ ...formData, common_mistakes: u }); }} style={inputStyle} />
                        <button type="button" onClick={() => removeArrayItem("common_mistakes", i)} style={{ padding: "8px", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: "8px", cursor: "pointer" }}><Trash size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: MCQs Quiz */}
              {activeTab === "mcqs" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <label style={labelStyle}>MCQ Practice Questions (Exactly 15 generated)</label>
                    <button type="button" onClick={() => addArrayItem("mcq_quiz", { question: "", options: ["", "", "", ""], answer: "", explanation: "", difficulty: "Beginner" })}
                      style={{ fontSize: "12px", color: "#6366f1", background: "#eef2ff", border: "none", borderRadius: "8px", padding: "5px 12px", cursor: "pointer", fontWeight: 600 }}>
                      + Add MCQ
                    </button>
                  </div>
                  {(formData.mcq_quiz || []).map((mcq, i) => (
                    <div key={i} style={{ background: "#f8fafc", borderRadius: "12px", padding: "16px", marginBottom: "16px", position: "relative", border: "1px solid #f1f5f9" }}>
                      <button type="button" onClick={() => removeArrayItem("mcq_quiz", i)}
                        style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}><Trash size={14} /></button>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "5fr 1fr", gap: "10px", marginBottom: "10px" }}>
                        <div>
                          <label style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>QUESTION {i + 1}</label>
                          <input type="text" placeholder="Question statement" value={mcq.question || ""} onChange={e => { const u = [...formData.mcq_quiz]; u[i] = { ...u[i], question: e.target.value }; setFormData({ ...formData, mcq_quiz: u }); }} style={{ ...inputStyle, fontWeight: 600 }} />
                        </div>
                        <div>
                          <label style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>DIFFICULTY</label>
                          <select value={mcq.difficulty || "Beginner"} onChange={e => { const u = [...formData.mcq_quiz]; u[i] = { ...u[i], difficulty: e.target.value }; setFormData({ ...formData, mcq_quiz: u }); }} style={inputStyle}>
                            <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                        {["A", "B", "C", "D"].map((choice, optIdx) => (
                          <div key={choice}>
                            <label style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8" }}>Option {choice}</label>
                            <input type="text" placeholder={`Option ${choice}`} value={(mcq.options || [])[optIdx] || ""} onChange={e => {
                              const u = [...formData.mcq_quiz];
                              const opts = [...(u[i].options || [])];
                              opts[optIdx] = e.target.value;
                              u[i] = { ...u[i], options: opts };
                              setFormData({ ...formData, mcq_quiz: u });
                            }} style={inputStyle} />
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: "10px" }}>
                        <div>
                          <label style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>CORRECT ANSWER</label>
                          <input type="text" placeholder="Must match exact option text" value={mcq.answer || ""} onChange={e => { const u = [...formData.mcq_quiz]; u[i] = { ...u[i], answer: e.target.value }; setFormData({ ...formData, mcq_quiz: u }); }} style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>EXPLANATION</label>
                          <input type="text" placeholder="Why is this answer correct?" value={mcq.explanation || ""} onChange={e => { const u = [...formData.mcq_quiz]; u[i] = { ...u[i], explanation: e.target.value }; setFormData({ ...formData, mcq_quiz: u }); }} style={inputStyle} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 4: Coding Challenges */}
              {activeTab === "challenges" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <label style={labelStyle}>Interactive Coding Challenges (Exactly 5 generated)</label>
                    <button type="button" onClick={() => addArrayItem("coding_challenges", { title: "", problem: "", starter_code: "", expected_output: "", sample_input: "", sample_output: "", hints: [], solution: "", explanation: "", difficulty: "Beginner" })}
                      style={{ fontSize: "12px", color: "#6366f1", background: "#eef2ff", border: "none", borderRadius: "8px", padding: "5px 12px", cursor: "pointer", fontWeight: 600 }}>
                      + Add Challenge
                    </button>
                  </div>
                  {(formData.coding_challenges || []).map((ch, i) => (
                    <div key={i} style={{ background: "#f8fafc", borderRadius: "12px", padding: "16px", marginBottom: "16px", position: "relative", border: "1px solid #f1f5f9" }}>
                      <button type="button" onClick={() => removeArrayItem("coding_challenges", i)}
                        style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}><Trash size={14} /></button>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "10px", marginBottom: "10px" }}>
                        <div>
                          <label style={labelStyle}>CHALLENGE {i + 1}: TITLE</label>
                          <input type="text" placeholder="Challenge title" value={ch.title || ""} onChange={e => { const u = [...formData.coding_challenges]; u[i] = { ...u[i], title: e.target.value }; setFormData({ ...formData, coding_challenges: u }); }} style={{ ...inputStyle, fontWeight: 600 }} />
                        </div>
                        <div>
                          <label style={labelStyle}>DIFFICULTY</label>
                          <select value={ch.difficulty || "Beginner"} onChange={e => { const u = [...formData.coding_challenges]; u[i] = { ...u[i], difficulty: e.target.value }; setFormData({ ...formData, coding_challenges: u }); }} style={inputStyle}>
                            <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ marginBottom: "10px" }}>
                        <label style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>PROBLEM STATEMENT</label>
                        <textarea value={ch.problem || ch.problem_statement || ""} onChange={e => { const u = [...formData.coding_challenges]; u[i] = { ...u[i], problem: e.target.value, problem_statement: e.target.value }; setFormData({ ...formData, coding_challenges: u }); }} style={{ ...inputStyle, minHeight: "55px" }} />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                        <div>
                          <label style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>STARTER CODE</label>
                          <textarea value={ch.starter_code || ""} onChange={e => { const u = [...formData.coding_challenges]; u[i] = { ...u[i], starter_code: e.target.value }; setFormData({ ...formData, coding_challenges: u }); }} style={{ ...inputStyle, fontFamily: "monospace", minHeight: "85px", background: "#1e293b", color: "#38bdf8", border: "none" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>EXPECTED SOLUTION</label>
                          <textarea value={ch.solution || ""} onChange={e => { const u = [...formData.coding_challenges]; u[i] = { ...u[i], solution: e.target.value }; setFormData({ ...formData, coding_challenges: u }); }} style={{ ...inputStyle, fontFamily: "monospace", minHeight: "85px", background: "#1e293b", color: "#10b981", border: "none" }} />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                        <div>
                          <label style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>SAMPLE INPUT</label>
                          <input type="text" placeholder="e.g. 5" value={ch.sample_input || ""} onChange={e => { const u = [...formData.coding_challenges]; u[i] = { ...u[i], sample_input: e.target.value }; setFormData({ ...formData, coding_challenges: u }); }} style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>SAMPLE OUTPUT</label>
                          <input type="text" placeholder="e.g. 25" value={ch.sample_output || ""} onChange={e => { const u = [...formData.coding_challenges]; u[i] = { ...u[i], sample_output: e.target.value }; setFormData({ ...formData, coding_challenges: u }); }} style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>EXPECTED STDOUT/RETURN</label>
                          <input type="text" placeholder="e.g. 25\n" value={ch.expected_output || ""} onChange={e => { const u = [...formData.coding_challenges]; u[i] = { ...u[i], expected_output: e.target.value }; setFormData({ ...formData, coding_challenges: u }); }} style={inputStyle} />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div>
                          <label style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>HINTS (COMMA SEPARATED)</label>
                          <input type="text" value={(ch.hints || []).join(", ")} onChange={e => {
                            const u = [...formData.coding_challenges];
                            u[i] = { ...u[i], hints: e.target.value.split(",").map(h => h.trim()) };
                            setFormData({ ...formData, coding_challenges: u });
                          }} style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>EXPLANATION</label>
                          <input type="text" value={ch.explanation || ""} onChange={e => { const u = [...formData.coding_challenges]; u[i] = { ...u[i], explanation: e.target.value }; setFormData({ ...formData, coding_challenges: u }); }} style={inputStyle} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 5: Practice Exercises */}
              {activeTab === "exercises" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <label style={labelStyle}>Practice Questions (Exactly 10 generated)</label>
                    <button type="button" onClick={() => addArrayItem("practice_exercises", { title: "", type: "Short Answer", question: "", code: "", expected_answer: "", hint: "", explanation: "", difficulty: "Beginner" })}
                      style={{ fontSize: "12px", color: "#6366f1", background: "#eef2ff", border: "none", borderRadius: "8px", padding: "5px 12px", cursor: "pointer", fontWeight: 600 }}>
                      + Add Exercise
                    </button>
                  </div>
                  {(formData.practice_exercises || []).map((ex, i) => (
                    <div key={i} style={{ background: "#f8fafc", borderRadius: "12px", padding: "16px", marginBottom: "16px", position: "relative", border: "1px solid #f1f5f9" }}>
                      <button type="button" onClick={() => removeArrayItem("practice_exercises", i)}
                        style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}><Trash size={14} /></button>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr", gap: "10px", marginBottom: "10px" }}>
                        <div>
                          <label style={labelStyle}>EXERCISE {i + 1}: TITLE</label>
                          <input type="text" value={ex.title || ""} onChange={e => { const u = [...formData.practice_exercises]; u[i] = { ...u[i], title: e.target.value }; setFormData({ ...formData, practice_exercises: u }); }} style={{ ...inputStyle, fontWeight: 600 }} />
                        </div>
                        <div>
                          <label style={labelStyle}>DIFFICULTY</label>
                          <select value={ex.difficulty || "Beginner"} onChange={e => { const u = [...formData.practice_exercises]; u[i] = { ...u[i], difficulty: e.target.value }; setFormData({ ...formData, practice_exercises: u }); }} style={inputStyle}>
                            <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>QUESTION TYPE</label>
                          <select value={ex.type || "Short Answer"} onChange={e => { const u = [...formData.practice_exercises]; u[i] = { ...u[i], type: e.target.value }; setFormData({ ...formData, practice_exercises: u }); }} style={inputStyle}>
                            <option>Short Answer</option><option>Output Prediction</option><option>Fill in the Blank</option><option>Debug the Code</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ marginBottom: "10px" }}>
                        <label style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>QUESTION</label>
                        <input type="text" value={ex.question || ""} onChange={e => { const u = [...formData.practice_exercises]; u[i] = { ...u[i], question: e.target.value }; setFormData({ ...formData, practice_exercises: u }); }} style={inputStyle} />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div>
                          <label style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>EXPECTED ANSWER/SOLUTION</label>
                          <textarea value={ex.expected_answer || ""} onChange={e => { const u = [...formData.practice_exercises]; u[i] = { ...u[i], expected_answer: e.target.value }; setFormData({ ...formData, practice_exercises: u }); }} style={{ ...inputStyle, minHeight: "55px", fontFamily: "monospace" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>EXPLANATION</label>
                          <textarea value={ex.explanation || ""} onChange={e => { const u = [...formData.practice_exercises]; u[i] = { ...u[i], explanation: e.target.value }; setFormData({ ...formData, practice_exercises: u }); }} style={{ ...inputStyle, minHeight: "55px" }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "12px" }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: "14px", border: "1.5px solid #e5e7eb", borderRadius: "12px", color: "#475569", fontWeight: 700, cursor: "pointer", background: "transparent" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ flex: 3, padding: "14px", background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 12px rgba(99,102,241,0.4)" }}>
                  {saving ? <div className="spinner-border spinner-border-sm" /> : <Save size={18} />}
                  {saving ? "Saving Changes..." : "Save and Overwrite"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminLessons;
