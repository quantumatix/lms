import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { Sparkles, BookOpen, Code2, HelpCircle, Loader2, ClipboardList, Layers } from "lucide-react";
import { API_BASE } from "../../config";


function AdminAIGenerator() {
  const [activeTab, setActiveTab] = useState("lesson");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("python-core");

  const [lessonForm, setLessonForm] = useState({ topic: "", difficulty: "beginner" });
  const [mcqForm, setMcqForm] = useState({ topic: "", number_of_questions: 5, difficulty: "beginner", lesson_id: "" });
  const [codeForm, setCodeForm] = useState({ topic: "", number_of_challenges: 3, difficulty: "beginner", lesson_id: "" });
  const [exerciseForm, setExerciseForm] = useState({ topic: "", number_of_exercises: 5, difficulty: "beginner", lesson_id: "" });

  // Load all courses
  useEffect(() => {
    fetch(`${API_BASE}/admin/courses`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data);
          setSelectedCourseId(data[0].id);
        }
      })
      .catch((err) => console.error("Error fetching courses:", err));
  }, []);

  // When selectedCourseId changes, fetch lessons for that course
  useEffect(() => {
    if (!selectedCourseId) return;
    fetch(`${API_BASE}/lessons?username=admin@lms.com&course_id=${selectedCourseId}`)
      .then((r) => r.json())
      .then((data) => {
        const flat = [];
        data.forEach((cat) => cat.lessons.forEach((l) => flat.push(l)));
        setLessons(flat);
        if (flat.length > 0) {
          setMcqForm((prev) => ({ ...prev, lesson_id: flat[0].id }));
          setCodeForm((prev) => ({ ...prev, lesson_id: flat[0].id }));
          setExerciseForm((prev) => ({ ...prev, lesson_id: flat[0].id }));
        } else {
          setMcqForm((prev) => ({ ...prev, lesson_id: "" }));
          setCodeForm((prev) => ({ ...prev, lesson_id: "" }));
          setExerciseForm((prev) => ({ ...prev, lesson_id: "" }));
        }
      })
      .catch((err) => console.error("Error fetching lessons:", err));
  }, [selectedCourseId]);

  const token = localStorage.getItem("token");

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      let endpoint = "";
      let body = {};

      if (activeTab === "lesson") {
        endpoint = "/admin/ai/generate-lesson";
        body = { ...lessonForm, course_id: selectedCourseId };
      } else if (activeTab === "mcq") {
        endpoint = "/admin/ai/generate-mcq";
        body = { ...mcqForm, course_id: selectedCourseId };
      } else if (activeTab === "code") {
        endpoint = "/admin/ai/generate-coding-challenges";
        body = { ...codeForm, course_id: selectedCourseId };
      } else {
        endpoint = "/admin/ai/generate-practice-exercises";
        body = { ...exerciseForm, course_id: selectedCourseId };
      }

      // Check if topic is blank
      if (!body.topic || !body.topic.trim()) {
        throw new Error("Topic cannot be empty");
      }

      if (activeTab === "mcq" && !body.lesson_id) {
        throw new Error("Please select a lesson to associate these MCQs with");
      }

      if (activeTab === "code" && !body.lesson_id) {
        throw new Error("Please select a lesson to associate these coding challenges with");
      }

      if (activeTab === "exercise" && !body.lesson_id) {
        throw new Error("Please select a lesson to associate these practice exercises with");
      }

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedTech = courses.find((c) => c.id === selectedCourseId)?.technology || "Python";

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">
            <Sparkles size={22} className="text-warning" /> AI Content Generator
          </h1>
          <p className="text-muted mb-0">Generate course-specific lessons, MCQs, coding challenges, and exercises.</p>
        </div>

        {/* Course Selector Dropdown */}
        <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-3 border shadow-sm">
          <Layers size={18} className="text-primary" />
          <span className="fw-semibold small text-muted">Target Course:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              setResult(null);
            }}
            className="form-select form-select-sm border-0 fw-bold text-dark bg-transparent"
            style={{ width: "auto", cursor: "pointer", boxShadow: "none" }}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.technology})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        {[
          { key: "lesson", label: "Lesson", icon: <BookOpen size={15} /> },
          { key: "mcq", label: "MCQ Questions", icon: <HelpCircle size={15} /> },
          { key: "code", label: "Coding Challenge", icon: <Code2 size={15} /> },
          { key: "exercise", label: "Practice Exercise", icon: <ClipboardList size={15} /> },
        ].map((tab) => (
          <li key={tab.key} className="nav-item">
            <button
              className={`nav-link d-flex align-items-center gap-2 ${activeTab === tab.key ? "active fw-semibold" : ""}`}
              onClick={() => { setActiveTab(tab.key); setResult(null); setError(null); }}
            >
              {tab.icon} {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="row g-4">
        {/* Form */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 p-4">
            <h6 className="fw-bold mb-3">Generation Settings</h6>

            {activeTab === "lesson" && (
              <>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Topic</label>
                  <input
                    className="form-control"
                    placeholder={`e.g. ${selectedTech} Fundamentals, OOP, or Async`}
                    value={lessonForm.topic}
                    onChange={(e) => setLessonForm({ ...lessonForm, topic: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Difficulty</label>
                  <select className="form-select" value={lessonForm.difficulty} onChange={(e) => setLessonForm({ ...lessonForm, difficulty: e.target.value })}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === "mcq" && (
              <>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Associated Lesson</label>
                  <select
                    className="form-select"
                    value={mcqForm.lesson_id}
                    onChange={(e) => setMcqForm({ ...mcqForm, lesson_id: e.target.value })}
                  >
                    <option value="">{lessons.length === 0 ? "-- No lessons in this course yet --" : "-- Select Lesson --"}</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title} ({l.id})
                      </option>
                    ))}
                  </select>
                  {lessons.length === 0 && (
                    <div className="alert alert-warning py-1 px-2 small mt-2 mb-0" style={{ fontSize: "11px" }}>
                      ⚠️ This course has no lessons yet. Please generate a lesson under the &ldquo;Lesson&rdquo; tab first.
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Topic</label>
                  <input
                    className="form-control"
                    placeholder={`e.g. ${selectedTech} Syntax or Structures`}
                    value={mcqForm.topic}
                    onChange={(e) => setMcqForm({ ...mcqForm, topic: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Number of Questions</label>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    max={20}
                    value={mcqForm.number_of_questions}
                    onChange={(e) => setMcqForm({ ...mcqForm, number_of_questions: parseInt(e.target.value) || 5 })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Difficulty</label>
                  <select className="form-select" value={mcqForm.difficulty} onChange={(e) => setMcqForm({ ...mcqForm, difficulty: e.target.value })}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === "code" && (
              <>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Associated Lesson</label>
                  <select
                    className="form-select"
                    value={codeForm.lesson_id}
                    onChange={(e) => setCodeForm({ ...codeForm, lesson_id: e.target.value })}
                  >
                    <option value="">{lessons.length === 0 ? "-- No lessons in this course yet --" : "-- Select Lesson --"}</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title} ({l.id})
                      </option>
                    ))}
                  </select>
                  {lessons.length === 0 && (
                    <div className="alert alert-warning py-1 px-2 small mt-2 mb-0" style={{ fontSize: "11px" }}>
                      ⚠️ This course has no lessons yet. Please generate a lesson under the &ldquo;Lesson&rdquo; tab first.
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Topic</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Sorting Algorithms"
                    value={codeForm.topic}
                    onChange={(e) => setCodeForm({ ...codeForm, topic: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Number of Challenges</label>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    max={10}
                    value={codeForm.number_of_challenges}
                    onChange={(e) => setCodeForm({ ...codeForm, number_of_challenges: parseInt(e.target.value) || 3 })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Difficulty</label>
                  <select className="form-select" value={codeForm.difficulty} onChange={(e) => setCodeForm({ ...codeForm, difficulty: e.target.value })}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === "exercise" && (
              <>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Associated Lesson</label>
                  <select
                    className="form-select"
                    value={exerciseForm.lesson_id}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, lesson_id: e.target.value })}
                  >
                    <option value="">{lessons.length === 0 ? "-- No lessons in this course yet --" : "-- Select Lesson --"}</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title} ({l.id})
                      </option>
                    ))}
                  </select>
                  {lessons.length === 0 && (
                    <div className="alert alert-warning py-1 px-2 small mt-2 mb-0" style={{ fontSize: "11px" }}>
                      ⚠️ This course has no lessons yet. Please generate a lesson under the &ldquo;Lesson&rdquo; tab first.
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Topic</label>
                  <input
                    className="form-control"
                    placeholder="e.g. For Loops & Ranges"
                    value={exerciseForm.topic}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, topic: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Number of Exercises</label>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    max={15}
                    value={exerciseForm.number_of_exercises}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, number_of_exercises: parseInt(e.target.value) || 5 })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Difficulty</label>
                  <select className="form-select" value={exerciseForm.difficulty} onChange={(e) => setExerciseForm({ ...exerciseForm, difficulty: e.target.value })}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </>
            )}

            <button
              className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={handleGenerate}
              disabled={loading || (activeTab !== "lesson" && lessons.length === 0)}
              style={{ backgroundColor: "#4f46e5", borderColor: "#4f46e5", opacity: (activeTab !== "lesson" && lessons.length === 0) ? 0.6 : 1 }}
              title={activeTab !== "lesson" && lessons.length === 0 ? "Please create or generate a lesson for this course first" : ""}
            >
              {loading ? <><Loader2 size={16} className="spin" /> Generating...</> : <><Sparkles size={16} /> Generate</>}
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="col-md-8">
          <div className="card border-0 shadow-sm rounded-3 p-4" style={{ minHeight: "300px" }}>
            <h6 className="fw-bold mb-3">Generated Content</h6>
            {!result && !error && !loading && (
              <div className="text-center text-muted py-5">
                <Sparkles size={40} className="mb-3 opacity-25" />
                <p>Fill in the settings and click Generate to create AI-powered content.</p>
              </div>
            )}
            {loading && (
              <div className="text-center py-5">
                <Loader2 size={36} className="text-primary mb-3 spin" />
                <p className="text-muted">AI is generating your content...</p>
              </div>
            )}
            {error && (
              <div className="alert alert-danger">
                <strong>Error:</strong> {error}
              </div>
            )}
            {result && activeTab === "mcq" && result.mcqs ? (
              <div className="d-flex flex-column gap-3">
                <div className="alert alert-success d-flex align-items-center justify-content-between p-3 rounded-3 mb-2">
                  <div>
                    <strong className="d-block mb-1">{result.message}</strong>
                    <span className="small text-success-emphasis">Associated with lesson: <code className="fw-semibold bg-success-subtle px-2 py-1 rounded text-success">{mcqForm.lesson_id}</code></span>
                  </div>
                  <span className="badge bg-success px-3 py-2 fs-6 rounded-pill">{result.total} MCQs</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                  {result.mcqs.map((q, i) => (
                    <div key={i} className="bg-white border rounded-3 p-4 shadow-sm" style={{ border: "1px solid #e5e7eb" }}>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="bg-dark text-white fw-bold rounded-2 px-2 py-1 small">Question {i + 1}</span>
                        <span className="badge text-capitalize" style={{ backgroundColor: "#eef2ff", color: "#4f46e5" }}>
                          {q.difficulty || mcqForm.difficulty}
                        </span>
                      </div>
                      <p className="fw-bold text-dark mb-3" style={{ fontSize: "14px", lineHeight: "1.5" }}>{q.question}</p>
                      <div className="d-flex flex-column gap-2 mb-3">
                        {(q.options || []).map((opt, j) => (
                          <div key={j} className="p-3 rounded-3 border" style={{
                            fontSize: "13px",
                            backgroundColor: opt === q.answer ? "#ecfdf5" : "#f8fafc",
                            borderColor: opt === q.answer ? "#6ee7b7" : "#e5e7eb",
                            color: opt === q.answer ? "#065f46" : "#4b5563",
                            fontWeight: opt === q.answer ? "600" : "normal"
                          }}>
                            {opt === q.answer ? <span className="me-2 text-success fw-bold">✓</span> : null}
                            {opt}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <div className="mt-3 p-3 bg-light rounded-3 border-start border-primary border-4" style={{ fontSize: "13px" }}>
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : result && activeTab === "code" && result.coding_challenges ? (
              <div className="d-flex flex-column gap-3">
                <div className="alert alert-success d-flex align-items-center justify-content-between p-3 rounded-3 mb-2">
                  <div>
                    <strong className="d-block mb-1">{result.message}</strong>
                    <span className="small text-success-emphasis">Associated with lesson: <code className="fw-semibold bg-success-subtle px-2 py-1 rounded text-success">{codeForm.lesson_id}</code></span>
                  </div>
                  <span className="badge bg-success px-3 py-2 fs-6 rounded-pill">{result.total} Challenges</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
                  {result.coding_challenges.map((c, i) => (
                    <div key={i} className="bg-white border rounded-3 p-4 shadow-sm" style={{ border: "1px solid #e5e7eb" }}>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="bg-dark text-white fw-bold rounded-2 px-2 py-1 small">Challenge {i + 1}</span>
                        <span className="badge text-capitalize" style={{ backgroundColor: "#eef2ff", color: "#4f46e5" }}>
                          {c.difficulty || codeForm.difficulty}
                        </span>
                      </div>
                      
                      <h5 className="fw-bold text-dark mb-3">{c.title}</h5>
                      
                      <div className="mb-3">
                        <h6 className="fw-bold text-muted small uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Problem Statement</h6>
                        <div className="bg-light p-3 rounded-3 text-secondary" style={{ fontSize: "13px", whiteSpace: "pre-wrap", border: "1px solid #f1f5f9" }}>
                          {c.problem}
                        </div>
                      </div>

                      <div className="row g-3 mb-3">
                        {c.sample_input && (
                          <div className="col-md-6">
                            <h6 className="fw-bold text-muted small uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Sample Input</h6>
                            <pre className="bg-light p-2 rounded-2 border text-dark" style={{ fontSize: "12px", whiteSpace: "pre-wrap" }}>{c.sample_input}</pre>
                          </div>
                        )}
                        {c.sample_output && (
                          <div className="col-md-6">
                            <h6 className="fw-bold text-muted small uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Sample Output</h6>
                            <pre className="bg-light p-2 rounded-2 border text-dark" style={{ fontSize: "12px", whiteSpace: "pre-wrap" }}>{c.sample_output}</pre>
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <h6 className="fw-bold text-muted small uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Starter Code</h6>
                        <pre className="bg-dark text-white p-3 rounded-3" style={{ fontSize: "12px", fontFamily: "monospace", overflowX: "auto" }}>
                          {c.starter_code}
                        </pre>
                      </div>

                      {c.expected_output && (
                        <div className="mb-3">
                          <h6 className="fw-bold text-muted small uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Expected Output</h6>
                          <pre className="bg-light p-2 rounded-2 border text-dark" style={{ fontSize: "12px" }}>
                            {c.expected_output}
                          </pre>
                        </div>
                      )}

                      {c.hints && c.hints.length > 0 && (
                        <div className="mb-3">
                          <h6 className="fw-bold text-muted small uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Hints</h6>
                          <ul className="text-secondary ps-3" style={{ fontSize: "13px" }}>
                            {c.hints.map((hint, hi) => (
                              <li key={hi} className="mb-1">{hint}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {c.explanation && (
                        <div className="mt-3 p-3 bg-light rounded-3 border-start border-primary border-4" style={{ fontSize: "13px" }}>
                          <strong>Explanation:</strong> {c.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : result && activeTab === "exercise" && result.practice_exercises ? (
              <div className="d-flex flex-column gap-3">
                <div className="alert alert-success d-flex align-items-center justify-content-between p-3 rounded-3 mb-2">
                  <div>
                    <strong className="d-block mb-1">{result.message}</strong>
                    <span className="small text-success-emphasis">Associated with lesson: <code className="fw-semibold bg-success-subtle px-2 py-1 rounded text-success">{exerciseForm.lesson_id}</code></span>
                  </div>
                  <span className="badge bg-success px-3 py-2 fs-6 rounded-pill">{result.total} Exercises</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
                  {result.practice_exercises.map((ex, i) => (
                    <div key={i} className="bg-white border rounded-3 p-4 shadow-sm" style={{ border: "1px solid #e5e7eb" }}>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="bg-dark text-white fw-bold rounded-2 px-2 py-1 small">Exercise {i + 1}</span>
                        <div className="d-flex gap-2">
                          <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill px-2 py-1 small">
                            {ex.type}
                          </span>
                          <span className="badge text-capitalize" style={{ backgroundColor: "#eef2ff", color: "#4f46e5" }}>
                            {ex.difficulty || exerciseForm.difficulty}
                          </span>
                        </div>
                      </div>
                      
                      <h5 className="fw-bold text-dark mb-3">{ex.title}</h5>
                      
                      <div className="mb-3">
                        <h6 className="fw-bold text-muted small uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Question</h6>
                        <p className="text-secondary mb-0" style={{ fontSize: "13px" }}>{ex.question}</p>
                      </div>

                      {ex.code && (
                        <div className="mb-3">
                          <h6 className="fw-bold text-muted small uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Code Block</h6>
                          <pre className="bg-dark text-white p-3 rounded-3" style={{ fontSize: "12px", fontFamily: "monospace", overflowX: "auto" }}>
                            {ex.code}
                          </pre>
                        </div>
                      )}

                      {ex.expected_answer && (
                        <div className="mb-3">
                          <h6 className="fw-bold text-muted small uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Expected Answer / Solution</h6>
                          <div className="p-3 bg-light rounded-3 text-dark fw-semibold" style={{ fontSize: "13px", border: "1px dashed #cbd5e1" }}>
                            {ex.expected_answer}
                          </div>
                        </div>
                      )}

                      {ex.hint && (
                        <div className="mb-3">
                          <h6 className="fw-bold text-muted small uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Hint</h6>
                          <p className="text-muted italic mb-0" style={{ fontSize: "13px", fontStyle: "italic" }}>💡 {ex.hint}</p>
                        </div>
                      )}

                      {ex.explanation && (
                        <div className="mt-3 p-3 bg-light rounded-3 border-start border-primary border-4" style={{ fontSize: "13px" }}>
                          <strong>Explanation:</strong> {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : result && activeTab === "lesson" ? (
              <div className="d-flex flex-column gap-4">
                {/* Lesson Header Card */}
                <div className="alert alert-success d-flex align-items-center justify-content-between p-3 rounded-3 mb-2 animate__animated animate__fadeIn">
                  <div>
                    <strong className="d-block mb-1 fs-5">✨ Lesson Generated & Seeded Successfully</strong>
                    <span className="small text-success-emphasis">Lesson ID in Database: <code className="fw-semibold bg-success-subtle px-2 py-1 rounded text-success">{result.id}</code></span>
                  </div>
                  <span className="badge bg-warning text-dark px-3 py-2 fs-6 rounded-pill" style={{ letterSpacing: "0.5px" }}>{result.xp_reward || 100} XP</span>
                </div>

                <div className="bg-white border rounded-3 p-4 shadow-sm animate__animated animate__fadeInUp" style={{ border: "1px solid #e5e7eb" }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="badge bg-dark px-2.5 py-1 text-white fw-semibold rounded-2">{result.category_title || "Python Basics"}</span>
                    <span className="badge px-3 py-1.5 text-capitalize text-white rounded-pill" style={{ backgroundColor: "#4f46e5" }}>
                      {result.difficulty || lessonForm.difficulty}
                    </span>
                  </div>

                  <h3 className="fw-bold text-dark mb-2">{result.title}</h3>
                  <p className="text-secondary mb-4" style={{ fontSize: "14px", fontStyle: "italic" }}>{result.description}</p>

                  <hr className="my-4" />

                  {/* Theory section */}
                  <div className="mb-4">
                    <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2" style={{ fontSize: "16px" }}>
                      <BookOpen size={18} className="text-primary" /> 1. Theoretical Concepts
                    </h5>
                    <div className="bg-light p-4 rounded-3 text-secondary" style={{ fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap", border: "1px solid #f1f5f9" }}>
                      {result.theory}
                    </div>
                  </div>

                  {/* Code Examples */}
                  {result.code_examples && result.code_examples.length > 0 && (
                    <div className="mb-4">
                      <h5 className="fw-bold text-dark mb-3" style={{ fontSize: "16px" }}>2. Code Examples</h5>
                      <div className="d-flex flex-column gap-3">
                        {result.code_examples.map((ex, idx) => (
                          <div key={idx} className="border rounded-3 p-3 bg-light-subtle">
                            <h6 className="fw-bold text-dark mb-2" style={{ fontSize: "14px" }}>{idx + 1}. {ex.title}</h6>
                            <pre className="bg-dark text-white p-3 rounded-3 mb-2" style={{ fontSize: "12px", fontFamily: "monospace", overflowX: "auto" }}>
                              {ex.code}
                            </pre>
                            {ex.output && (
                              <div className="p-2.5 bg-secondary-subtle rounded border" style={{ fontSize: "12px", borderStyle: "dashed" }}>
                                <strong>Expected Output:</strong> <code className="text-dark bg-transparent px-0 py-0">{ex.output}</code>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Common Mistakes */}
                  {result.common_mistakes && result.common_mistakes.length > 0 && (
                    <div className="mb-4">
                      <h5 className="fw-bold text-dark mb-3" style={{ fontSize: "16px" }}>3. Common Mistakes to Avoid</h5>
                      <ul className="list-group list-group-flush border rounded-3 overflow-hidden">
                        {result.common_mistakes.map((mistake, idx) => (
                          <li key={idx} className="list-group-item bg-light-subtle text-secondary py-2.5 px-3" style={{ fontSize: "13.5px" }}>
                            ❌ {mistake}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Real World Use Cases */}
                  {result.real_world_use_cases && result.real_world_use_cases.length > 0 && (
                    <div className="mb-4">
                      <h5 className="fw-bold text-dark mb-3" style={{ fontSize: "16px" }}>4. Real-world Use Cases</h5>
                      <ul className="list-group list-group-flush border rounded-3 overflow-hidden">
                        {result.real_world_use_cases.map((use_case, idx) => (
                          <li key={idx} className="list-group-item bg-light-subtle text-secondary py-2.5 px-3" style={{ fontSize: "13.5px" }}>
                            🚀 {use_case}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              result && (
                <pre className="bg-light rounded p-3" style={{ fontSize: "13px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              )
            )}
          </div>
        </div>
      </div>

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );
}

export default AdminAIGenerator;
