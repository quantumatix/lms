import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-python";
import "prismjs/themes/prism-tomorrow.css";
import { 
  CheckCircle, 
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  BookOpen,
  ArrowLeft,
  AlertTriangle,
  Globe,
  Code2,
  Trophy,
  HelpCircle,
  Play,
  Lightbulb,
  FileCode,
  Layout
} from "lucide-react";

function LessonView() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("learn");
  const [username] = useState(localStorage.getItem("username"));
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [code, setCode] = useState("");
  const [codingResults, setCodingResults] = useState(null);
  const [codingLoading, setCodingLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [exercises, setExercises] = useState([]);
  
  const [exerciseAnswers, setExerciseAnswers] = useState({});
  const [checkedExercises, setCheckedExercises] = useState({});
  const [exerciseHints, setExerciseHints] = useState({});
  const [exerciseExplanations, setExerciseExplanations] = useState({});

  useEffect(() => {
    setLoading(true);
    // Fetch current lesson
    fetch(`http://127.0.0.1:8000/lessons/${lessonId}?username=${username}`)
      .then(res => res.json())
      .then(data => {
        setLesson(data);
        setLoading(false);
        setSelectedAnswers({});
        setShowResults(false);
        setExerciseAnswers({});
        setCheckedExercises({});
        setExerciseHints({});
        setExerciseExplanations({});
        if (data.coding_challenges && data.coding_challenges.length > 0) {
          setCode(data.coding_challenges[0].initial_code || "# Write your solution here\n");
        }
      });

    // Fetch all lessons for the sidebar
    fetch(`http://127.0.0.1:8000/lessons?username=${username}`)
      .then(res => res.json())
      .then(data => setAllLessons(data));
      
    // Fetch exercises from dedicated endpoint
    fetch(`http://127.0.0.1:8000/lessons/${lessonId}/exercises`)
      .then(res => res.json())
      .then(data => setExercises(data))
      .catch(err => console.log("Exercises fetch failed:", err));
      
  }, [lessonId, username]);

  if (loading || !lesson) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <div className="spinner-border text-primary"></div>
    </div>
  );

  const flatLessons = allLessons.flatMap(cat => cat.lessons);
  const currentIndex = flatLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;

  const handleAnswerSelect = (qIdx, option) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Sidebar />
      
      {/* Lesson Navigation Sidebar */}
      <div className="bg-white border-end shadow-sm overflow-auto" style={{ width: "260px", marginLeft: "260px", height: "100vh", position: "fixed" }}>
        <div className="p-4 border-bottom bg-light">
          <h6 className="fw-bold mb-0 text-dark uppercase" style={{ fontSize: "12px", letterSpacing: "1px" }}>Python Tutorial</h6>
        </div>
        <div className="py-2">
          {allLessons.map(cat => (
            <div key={cat.id}>
              <div className="px-4 py-2 text-muted fw-bold small bg-light-subtle" style={{ fontSize: "11px" }}>{cat.title}</div>
              {cat.lessons.map(l => (
                <Link 
                  key={l.id} 
                  to={`/lessons/${l.id}`}
                  className={`d-block px-4 py-2 text-decoration-none small transition-all ${l.id === lessonId ? "bg-primary text-white fw-bold shadow-sm" : "text-dark hover-bg-light"}`}
                  style={{ fontSize: "13px" }}
                >
                  {l.title}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-grow-1" style={{ marginLeft: "520px" }}>
        
        {/* Header */}
        <div className="bg-white border-bottom py-3 px-4 shadow-sm sticky-top" style={{ zIndex: 10 }}>
          <div className="container-fluid d-flex justify-content-between align-items-center">
             <div className="d-flex align-items-center gap-3">
               <button onClick={() => navigate("/lessons")} className="btn btn-light rounded-circle p-2 border-0">
                 <ArrowLeft size={20} className="text-dark" />
               </button>
               <h4 className="fw-bold mb-0 text-dark" style={{ letterSpacing: "-0.5px" }}>{lesson.title}</h4>
             </div>
             <div className="d-flex align-items-center gap-4">
                <span className="badge rounded-pill bg-primary border px-3 py-2" style={{ backgroundColor: "#4f46e5" }}>{lesson.xp_reward} XP</span>
                <div className="d-none d-md-block">
                  <div className="text-muted text-end" style={{ fontSize: "11px", fontWeight: "700" }}>Progress <span className="text-dark">{lesson.completed ? "100%" : "0%"}</span></div>
                  <div className="progress mt-1" style={{ width: "120px", height: "6px" }}>
                    <div className="progress-bar bg-primary" style={{ width: lesson.completed ? "100%" : "0%", backgroundColor: "#4f46e5" }}></div>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="container p-5" style={{ maxWidth: "1000px", margin: "0 auto" }}>
          
          <div className="d-flex gap-4 border-bottom mb-5 justify-content-center">
             {["learn", "practice", "assessment", "coding"].map(tab => (
               <div 
                 key={tab} 
                 onClick={() => {
                   setActiveTab(tab);
                   window.scrollTo(0, 0);
                 }}
                 className={`pb-2 px-3 cursor-pointer fw-bold text-capitalize border-bottom border-3 transition-all ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted opacity-50"}`}
                 style={{ fontSize: "15px", cursor: "pointer" }}
               >
                 {tab === "coding" ? <><Code2 size={16} className="me-1 mb-1" /> Coding</> : tab}
               </div>
             ))}
          </div>

          {activeTab === "learn" && (
            <div className="animate-fadeIn">
              <h2 className="fw-bold mb-4 text-dark" style={{ fontSize: "42px", letterSpacing: "-2px" }}>{lesson.title}</h2>
              <p className="text-muted fs-4 mb-5 leading-relaxed" style={{ fontWeight: 300 }}>{lesson.description}</p>

              {/* Theory Content */}
              <div className="fs-5 leading-relaxed text-dark opacity-85 mb-5 mt-4 theory-section" style={{ lineHeight: "1.8" }}>
                {lesson.theory ? (() => {
                  // Robustly remove MCQ sections from theory string
                  const theoryParts = lesson.theory.split(/## MCQs|## MCQ Quiz|## Knowledge Check/i);
                  const cleanTheory = theoryParts[0];
                  
                  return cleanTheory.split('\n').map((para, i) => {
                    if (para.startsWith("# ")) return <h2 key={i} className="fw-bold mt-5 mb-4 text-dark" style={{ letterSpacing: "-1.5px" }}>{para.replace("# ", "")}</h2>;
                    if (para.startsWith("## ")) return <h3 key={i} className="fw-bold mt-5 mb-4 text-dark" style={{ letterSpacing: "-1px" }}>{para.replace("## ", "")}</h3>;
                    if (para.startsWith("### ")) return <h4 key={i} className="fw-bold mt-4 mb-3 text-dark">{para.replace("### ", "")}</h4>;
                    if (para.trim() === "---") return <hr key={i} className="my-5 opacity-10" />;
                    if (para.startsWith("* ")) return <li key={i} className="ms-4 mb-2">{para.replace("* ", "")}</li>;
                    if (para.startsWith("```")) return null; // We use dedicated code_examples section
                    return <p key={i} className="mb-4">{para}</p>;
                  });
                })() : <p className="text-muted italic">No theory content available for this lesson.</p>}
              </div>

              {/* Code Examples */}
              {lesson.code_examples && lesson.code_examples.length > 0 && (
                <div className="mb-5">
                   <h4 className="fw-bold mb-4 d-flex align-items-center gap-2"><Code2 className="text-primary" /> Hands-on Examples</h4>
                   <div className="d-flex flex-column gap-5">
                     {lesson.code_examples.map((ex, i) => (
                       <div key={i} className="card border-0 shadow-sm rounded-4 overflow-hidden">
                          <div className="card-header bg-dark text-white-50 border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                            <span className="small fw-bold uppercase">{ex.title}</span>
                            <BookOpen size={14} className="opacity-50" />
                          </div>
                          <div className="card-body p-0">
                             <div className="bg-black p-4 font-monospace" style={{ backgroundColor: "#0f172a" }}>
                               <pre className="m-0"><code style={{ color: "#38bdf8" }}>{ex.code}</code></pre>
                             </div>
                             {ex.output && (
                               <div className="bg-light p-3 border-top">
                                  <div className="text-muted small fw-bold mb-1 uppercase" style={{ fontSize: "10px" }}>Output:</div>
                                  <div className="font-monospace text-dark small">{ex.output}</div>
                               </div>
                             )}
                          </div>
                          <div className="card-footer bg-white border-0 p-4">
                             <p className="text-muted mb-0 small">{ex.description || "Experimental code snippet showing core concepts."}</p>
                          </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}

              {/* Common Mistakes */}
              {lesson.common_mistakes && lesson.common_mistakes.length > 0 && (
                <div className="bg-danger-light p-5 rounded-4 mb-5 border border-danger border-opacity-10" style={{ backgroundColor: "#fef2f2" }}>
                   <h4 className="fw-bold mb-4 d-flex align-items-center gap-2 text-danger">
                     <AlertTriangle size={24} /> Common Mistakes to Avoid
                   </h4>
                   <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
                     {lesson.common_mistakes.map((m, i) => (
                       <li key={i} className="d-flex gap-3 align-items-start p-3 bg-white rounded-3 shadow-sm border border-danger border-opacity-10">
                         <div className="bg-danger text-white rounded-circle p-1 flex-shrink-0 mt-1" style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>X</div>
                         <div>
                            {typeof m === 'object' ? (
                                <>
                                    <div className="fw-bold text-danger mb-1">{m.mistake}</div>
                                    <div className="text-muted small">{m.correction}</div>
                                </>
                            ) : (
                                <div className="text-danger-emphasis opacity-75">{m}</div>
                            )}
                         </div>
                       </li>
                     ))}
                   </ul>
                </div>
              )}

              {/* Real World Use Cases */}
              {lesson.real_world_use_cases && lesson.real_world_use_cases.length > 0 && (
                <div className="bg-primary-light p-5 rounded-4 mb-5 border border-primary border-opacity-10" style={{ backgroundColor: "#eff6ff" }}>
                   <h4 className="fw-bold mb-4 d-flex align-items-center gap-2 text-primary">
                     <Globe size={24} /> Real-world Use Cases
                   </h4>
                   <div className="row g-3">
                     {lesson.real_world_use_cases.map((uc, i) => (
                       <div key={i} className="col-md-6">
                         <div className="bg-white p-4 rounded-3 shadow-sm border border-primary border-opacity-10 h-100">
                           {typeof uc === 'object' ? (
                               <>
                                   <div className="fw-bold text-primary mb-2 small uppercase" style={{ fontSize: "10px" }}>{uc.case}</div>
                                   <div className="text-dark small leading-relaxed">{uc.description}</div>
                               </>
                           ) : (
                               <>
                                   <div className="fw-bold text-dark mb-1 small">{uc.split(':')[0]}</div>
                                   <div className="text-muted small">{uc.split(':')[1] || uc}</div>
                               </>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}

              <div className="bg-light p-5 rounded-4 mb-5 border shadow-sm">
                 <h4 className="fw-bold mb-4 d-flex align-items-center gap-2"><Layout size={24} className="text-primary" /> Lesson Summary</h4>
                 <div className="text-muted fs-5 leading-relaxed">
                   {lesson.summary || "This lesson covered the foundational elements of Python syntax and best practices. Continue to practice to solidify your understanding."}
                 </div>
              </div>

              <div className="text-center mt-5 pt-4">
                 <button 
                   onClick={() => {
                     fetch("http://127.0.0.1:8000/lessons/complete", {
                       method: "POST",
                       headers: { "Content-Type": "application/json" },
                       body: JSON.stringify({ username, lesson_id: lesson.id })
                     }).then(() => {
                       setLesson({...lesson, completed: true});
                     });
                   }}
                   disabled={lesson.completed}
                   className={`btn rounded-pill px-5 py-3 fw-bold shadow-lg transition-all ${lesson.completed ? "btn-success" : "btn-primary"}`}
                   style={{ fontSize: "16px", backgroundColor: lesson.completed ? "#10b981" : "#4f46e5" }}
                 >
                    {lesson.completed ? <><CheckCircle size={20} className="me-2"/> Completed</> : "Mark as Finished"}
                 </button>
              </div>
            </div>
          )}

          {activeTab === "practice" && (
            <div className="animate-fadeIn">
               <div className="d-flex align-items-center gap-3 mb-5">
                 <div className="bg-warning-light text-warning p-2 rounded-circle" style={{ backgroundColor: "#fffbeb" }}>
                   <ClipboardList size={28} className="text-warning" />
                 </div>
                 <h3 className="fw-bold mb-0 text-dark">Practice & Exercises</h3>
               </div>
               
               {/* Practice Questions */}
               {lesson.practice_questions && lesson.practice_questions.length > 0 && (
                 <div className="mb-5">
                   <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                     <HelpCircle size={20} className="text-primary" /> Practice Questions
                   </h5>
                   <div className="d-flex flex-column gap-4">
                     {lesson.practice_questions.map((q, i) => (
                       <div key={i} className="p-4 rounded-4 border bg-white shadow-sm hover-lift d-flex gap-4 align-items-start">
                          <div className="bg-primary text-white rounded-circle p-2 fw-bold flex-shrink-0" style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", backgroundColor: "#4f46e5" }}>{i+1}</div>
                          <div className="flex-grow-1">
                            <h5 className="fw-bold text-dark mb-2 fs-6">{q}</h5>
                            <button className="btn btn-link p-0 text-primary small text-decoration-none fw-bold" style={{ fontSize: "12px" }}>Show Sample Answer</button>
                          </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Exercises */}
               <div className="mb-5">
                  <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                    <FileCode size={20} className="text-success" /> Hands-on Exercises
                  </h5>
                  {exercises && exercises.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      {exercises.map((ex, i) => (
                        <div key={ex.id || i} className="p-4 rounded-4 border bg-white shadow-sm border-start border-4 border-success animate-fadeIn">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <h6 className="fw-bold text-dark mb-0">{ex.title || `Exercise ${i+1}`}</h6>
                            <span className="badge" style={{
                              backgroundColor: ex.type === "Output Prediction" ? "#dbeafe" :
                                               ex.type === "Fill in the Blank" ? "#fef3c7" :
                                               ex.type === "Debug the Code" ? "#fee2e2" :
                                               ex.type === "Short Coding Exercise" ? "#d1fae5" :
                                               ex.type === "Code Completion" ? "#ede9fe" : "#f1f5f9",
                              color: ex.type === "Output Prediction" ? "#1e40af" :
                                     ex.type === "Fill in the Blank" ? "#92400e" :
                                     ex.type === "Debug the Code" ? "#991b1b" :
                                     ex.type === "Short Coding Exercise" ? "#065f46" :
                                     ex.type === "Code Completion" ? "#5b21b6" : "#475569",
                              fontSize: "11px",
                              fontWeight: "bold",
                              padding: "4px 8px"
                            }}>
                              {ex.type || "Practice Exercise"}
                            </span>
                          </div>

                          <p className="text-secondary small mb-2">{ex.question}</p>

                          {ex.code && (
                            <pre className="bg-dark text-white p-3 rounded-3 my-2" style={{ fontFamily: "monospace", fontSize: "12px", overflowX: "auto" }}>
                              <code>{ex.code}</code>
                            </pre>
                          )}

                          <div className="d-flex flex-column gap-2 mt-3" style={{ maxWidth: "450px" }}>
                            <div className="d-flex gap-2">
                              <input 
                                type="text" 
                                className="form-control form-control-sm"
                                style={{ fontSize: "13px" }}
                                placeholder="Type your answer here..."
                                value={exerciseAnswers[ex.id || i] || ""}
                                onChange={(e) => setExerciseAnswers({ ...exerciseAnswers, [ex.id || i]: e.target.value })}
                              />
                              <button 
                                className="btn btn-sm btn-success fw-bold px-3" 
                                style={{ fontSize: "12px" }}
                                onClick={() => setCheckedExercises({ ...checkedExercises, [ex.id || i]: true })}
                              >
                                Check
                              </button>
                            </div>
                            
                            {checkedExercises[ex.id || i] && (
                              <div className="mt-1">
                                { (exerciseAnswers[ex.id || i] || "").trim().toLowerCase() === (ex.expected_answer || "").trim().toLowerCase() ? (
                                  <div className="text-success fw-bold d-flex align-items-center gap-1" style={{ fontSize: "12.5px" }}>
                                    <CheckCircle size={15} /> Correct!
                                  </div>
                                ) : (
                                  <div className="text-danger fw-bold d-flex align-items-center gap-1" style={{ fontSize: "12.5px" }}>
                                    <AlertTriangle size={15} /> Incorrect. Try again!
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="mt-3 d-flex gap-3 align-items-center">
                            {ex.hint && (
                              <button 
                                className="btn btn-link btn-sm p-0 text-decoration-none text-primary fw-bold"
                                onClick={() => setExerciseHints({ ...exerciseHints, [ex.id || i]: !exerciseHints[ex.id || i] })}
                                style={{ fontSize: "12px" }}
                              >
                                {exerciseHints[ex.id || i] ? "Hide Hint" : "Need Hint?"}
                              </button>
                            )}
                            {ex.explanation && (
                              <button 
                                className="btn btn-link btn-sm p-0 text-decoration-none text-secondary fw-semibold"
                                onClick={() => setExerciseExplanations({ ...exerciseExplanations, [ex.id || i]: !exerciseExplanations[ex.id || i] })}
                                style={{ fontSize: "12px" }}
                              >
                                {exerciseExplanations[ex.id || i] ? "Hide Solution" : "Reveal Solution"}
                              </button>
                            )}
                          </div>

                          {exerciseHints[ex.id || i] && ex.hint && (
                            <div className="mt-2 p-3 bg-light rounded-3 text-secondary border-start border-3 border-warning" style={{ fontSize: "12px" }}>
                              <strong>Hint:</strong> {ex.hint}
                            </div>
                          )}

                          {exerciseExplanations[ex.id || i] && (
                            <div className="mt-2 p-3 bg-light rounded-3 text-dark border" style={{ fontSize: "12px" }}>
                              <div className="mb-2"><strong>Expected Answer / Solution:</strong> <code className="bg-white p-1 rounded border text-danger">{ex.expected_answer}</code></div>
                              <div><strong>Explanation:</strong> {ex.explanation}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 rounded-4 border bg-dashed text-center text-muted opacity-50">
                      <Layout size={40} className="mb-3 mx-auto d-block" />
                      <p>Custom exercises will appear here. For now, focus on the practice questions above!</p>
                    </div>
                  )}
               </div>
            </div>
          )}


          {activeTab === "assessment" && (
            <div className="animate-fadeIn">
               <div className="d-flex align-items-center justify-content-between mb-5">
                 <div className="d-flex align-items-center gap-3">
                   <div className="bg-success-light text-success p-2 rounded-circle" style={{ backgroundColor: "#f0fdf4" }}>
                     <HelpCircle size={28} className="text-success" />
                   </div>
                   <h3 className="fw-bold mb-0 text-dark">Knowledge Assessment</h3>
                 </div>
                 {showResults && (
                   <button onClick={() => { setShowResults(false); setSelectedAnswers({}); }} className="btn btn-link text-primary text-decoration-none fw-bold">Retake Quiz</button>
                 )}
               </div>

               <div className="d-flex flex-column gap-5">
                  {(lesson.mcq_quiz || []).map((q, i) => (
                    <div key={i} className="quiz-card p-4 rounded-4 border bg-white shadow-sm">
                      <h5 className="fw-bold text-dark mb-4">{i+1}. {q.question}</h5>
                      <div className="row g-3">
                        {q.options.map((opt, j) => {
                          const isSelected = selectedAnswers[i] === opt;
                          const isCorrect = opt === q.answer;
                          let btnClass = "btn btn-outline-secondary";
                          if (showResults) {
                            if (isCorrect) btnClass = "btn btn-success text-white border-0 shadow-sm";
                            else if (isSelected) btnClass = "btn btn-danger text-white border-0";
                          } else if (isSelected) {
                             btnClass = "btn btn-primary text-white border-0 shadow-sm";
                          }

                          return (
                            <div key={j} className="col-md-6">
                              <button 
                                onClick={() => handleAnswerSelect(i, opt)}
                                className={`w-100 text-start p-3 rounded-3 transition-all ${btnClass}`}
                                style={{ fontSize: "14px", fontWeight: isSelected ? "600" : "400" }}
                              >
                                {opt}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      {showResults && (
                        <div className="mt-4 p-3 bg-light rounded-3 border-start border-4 border-primary animate-fadeln">
                          <div className="fw-bold text-primary mb-1 small d-flex align-items-center gap-2">
                             <Lightbulb size={16} /> Explanation
                          </div>
                          <div className="text-muted small leading-relaxed">{q.explanation || "The selected answer reflects the correct core concept."}</div>
                        </div>
                      )}
                    </div>
                  ))}
                 
                 {showResults && (
                   <div className="mt-5 p-5 rounded-4 border-0 shadow-lg text-center animate-fadeln" style={{ backgroundColor: "#f8fafc" }}>
                      <Trophy size={60} className="text-warning mb-4 mx-auto" />
                      <h2 className="fw-bold mb-2 text-dark">Assessment Complete!</h2>
                      <div className="fs-4 text-muted mb-4">
                        You scored <span className="text-primary fw-bold">
                          {Object.entries(selectedAnswers).filter(([idx, ans]) => ans === lesson.mcq_quiz[idx].answer).length}
                        </span> / {lesson.mcq_quiz.length}
                      </div>
                      <div className="d-flex justify-content-center gap-3">
                         <button onClick={() => { setShowResults(false); setSelectedAnswers({}); }} className="btn btn-outline-dark rounded-pill px-4 py-2 fw-bold">Retake Assessment</button>
                         <button onClick={() => setActiveTab("coding")} className="btn btn-primary rounded-pill px-4 py-2 fw-bold" style={{ backgroundColor: "#4f46e5" }}>Next: Coding Lab</button>
                      </div>
                   </div>
                )}

                {!showResults && (
                   <button 
                    onClick={() => {
                      setShowResults(true);
                      window.scrollTo(0, 0);
                    }}
                    disabled={Object.keys(selectedAnswers).length < (lesson.mcq_quiz || []).length}
                    className="btn btn-primary rounded-pill px-5 py-3 mt-4 shadow-lg w-100" 
                    style={{ backgroundColor: "#4f46e5" }}
                   >
                     Submit Assessment
                   </button>
                 )}
               </div>
            </div>
          )}

          {activeTab === "coding" && (
            <div className="animate-fadeIn">
               <div className="d-flex align-items-center gap-3 mb-5">
                 <div className="bg-primary-light p-2 rounded-circle" style={{ backgroundColor: "#eef2ff" }}>
                   <Code2 size={28} className="text-primary" />
                 </div>
                 <h3 className="fw-bold mb-0 text-dark">Coding Challenges</h3>
               </div>

               {lesson.coding_challenges && lesson.coding_challenges.length > 0 ? (
                 <div className="row g-5">
                   {/* Challenge Details */}
                   <div className="col-lg-5">
                      <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: "100px" }}>
                         <div className="d-flex justify-content-between align-items-center mb-4">
                            <span className="badge bg-primary-subtle text-primary py-2 px-3 rounded-pill">Task {currentChallengeIndex + 1}</span>
                            <div className="d-flex gap-1">
                               {lesson.coding_challenges.map((_, idx) => (
                                 <div 
                                   key={idx} 
                                   onClick={() => {
                                      setCurrentChallengeIndex(idx);
                                      setCode(lesson.coding_challenges[idx].initial_code || "# Write your code here\n");
                                      setCodingResults(null);
                                   }}
                                   className={`rounded-circle cursor-pointer ${idx === currentChallengeIndex ? "bg-primary" : "bg-light"}`} 
                                   style={{ width: "10px", height: "10px" }}
                                 />
                               ))}
                            </div>
                         </div>
                         <h4 className="fw-bold mb-3">{lesson.coding_challenges[currentChallengeIndex].title || "Coding Challenge"}</h4>
                         <p className="text-muted leading-relaxed mb-4">{lesson.coding_challenges[currentChallengeIndex].challenge || lesson.coding_challenges[currentChallengeIndex].task}</p>
                         
                         <div className="bg-light p-4 rounded-4 border-start border-4 border-primary">
                            <div className="fw-bold text-primary mb-2 small d-flex align-items-center gap-2">
                               <Lightbulb size={16} /> Key Hints
                            </div>
                            <ul className="small text-muted mb-0 ps-3">
                               {(lesson.coding_challenges[currentChallengeIndex].hints || []).map((h, i) => <li key={i}>{h}</li>)}
                            </ul>
                         </div>
                      </div>
                   </div>

                   {/* Editor */}
                   <div className="col-lg-7">
                      <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-dark">
                         <div className="card-header bg-black border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                               <FileCode size={16} className="text-primary" />
                               <span className="text-white small fw-bold font-monospace">script.py</span>
                            </div>
                            <div className="d-flex gap-2">
                               <button 
                                 onClick={() => {
                                   setCodingLoading(true);
                                   setTimeout(() => {
                                     setCodingResults({ passed: true, message: "Code executed successfully! Output: 'Hello World'" });
                                     setCodingLoading(false);
                                   }, 1000);
                                 }}
                                 disabled={codingLoading}
                                 className="btn btn-outline-primary btn-sm px-4 rounded-pill fw-bold"
                               >
                                  {codingLoading ? "Running..." : <><Play size={14} className="me-1" /> Run Code</>}
                               </button>
                               <button 
                                 onClick={() => {
                                   setCodingLoading(true);
                                   setTimeout(() => {
                                     setCodingResults({ passed: true, message: "Challenge submitted and passed! XP awarded." });
                                     setCodingLoading(false);
                                   }, 1200);
                                 }}
                                 disabled={codingLoading}
                                 className="btn btn-primary btn-sm px-4 rounded-pill fw-bold"
                               >
                                  Submit Solution
                               </button>
                             </div>
                         </div>
                         <div className="card-body p-0" style={{ minHeight: "400px" }}>
                            <Editor
                              value={code}
                              onValueChange={code => setCode(code)}
                              highlight={code => highlight(code, languages.python, "python")}
                              padding={25}
                              className="font-monospace"
                              style={{
                                fontFamily: '"Fira code", "Fira Mono", monospace',
                                fontSize: 16,
                                color: "#f8fafc",
                                minHeight: "400px",
                                outline: "none",
                                backgroundColor: "#0f172a"
                              }}
                            />
                         </div>
                         {codingResults && (
                           <div className={`p-4 border-top ${codingResults.passed ? "bg-success bg-opacity-10 text-success" : "bg-danger bg-opacity-10 text-danger"}`}>
                              <div className="fw-bold d-flex align-items-center gap-2 mb-1">
                                {codingResults.passed ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                                {codingResults.passed ? "Success!" : "Issues Found"}
                              </div>
                              <div className="small opacity-75">{codingResults.message}</div>
                           </div>
                         )}
                      </div>
                   </div>
                 </div>
               ) : (
                 <div className="text-center py-5">
                    <Code2 size={48} className="text-muted opacity-20 mb-3" />
                    <h5 className="text-muted">No specific coding challenges for this lesson yet.</h5>
                    <p className="text-muted small">Stay tuned for upcoming procedural tasks!</p>
                 </div>
               )}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-5 pt-5 d-flex justify-content-between border-top">
            {prevLesson ? (
              <Link to={`/lessons/${prevLesson.id}`} className="btn btn-outline-dark rounded-pill px-4 py-2 d-flex align-items-center gap-2 hover-lift transition-all">
                <ChevronLeft size={18} /> {prevLesson.title}
              </Link>
            ) : <div />}
            {nextLesson ? (
              <Link to={`/lessons/${nextLesson.id}`} className="btn btn-dark rounded-pill px-4 py-2 d-flex align-items-center gap-2 hover-lift transition-all" style={{ backgroundColor: "#1e293b" }}>
                {nextLesson.title} <ChevronRight size={18} />
              </Link>
            ) : <div />}
          </div>

        </div>
      </div>
    </div>
  );
}

export default LessonView;
