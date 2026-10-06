import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import Sidebar from "../components/Sidebar";
import { 
  Trophy, 
  Lightbulb, 
  Play, 
  CheckCircle, 
  AlertCircle,
  History,
  Code,
  Zap,
  ChevronRight,
  Monitor
} from "lucide-react";
import { useCourse } from "../context/CourseContext";
import { API_BASE } from "../config";

function CodingPractice() {
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [code, setCode] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [history, setHistory] = useState([]);
  const [difficulty, setDifficulty] = useState("All");
  const [username] = useState(localStorage.getItem("username"));
  const { selectedCourse } = useCourse();

  useEffect(() => {
    fetchChallenges();
    fetchHistory();
  }, [difficulty, selectedCourse]);

  const fetchChallenges = () => {
    const courseParam = selectedCourse?.id ? `course_id=${selectedCourse.id}` : "course_id=python-core";
    const diffParam = difficulty !== "All" ? `&difficulty=${difficulty}` : "";
    const url = `${API_BASE}/challenges?${courseParam}${diffParam}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setChallenges(list);
        if (list.length > 0) {
          handleSelectChallenge(list[0]);
        } else {
          setSelectedChallenge(null);
          setCode("");
        }
      });
  };

  const fetchHistory = () => {
    const courseParam = selectedCourse?.id ? `?course_id=${selectedCourse.id}` : "";
    fetch(`${API_BASE}/history/${username}${courseParam}`)
      .then(res => res.json())
      .then(data => setHistory(Array.isArray(data) ? data : []));
  };

  const handleSelectChallenge = (ch) => {
    setSelectedChallenge(ch);
    setCode(ch.initial_code || ch.starter_code || "");
    setResults(null);
    setShowHint(false);
  };

  const handleRunCode = (isSubmit = false) => {
    setLoading(true);
    fetch(API_BASE + "/coding/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        lesson_id: selectedChallenge?.lesson_id || "",
        challenge_id: selectedChallenge?.id || "",
        code: code,
        submit: isSubmit
      })
    })
    .then(res => res.json())
    .then(data => {
      setResults(data);
      setLoading(false);
      fetchHistory(); // Refresh history
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  const currentLanguage = (selectedChallenge?.language || selectedCourse?.technology || "python").toLowerCase();
  const monacoLang = currentLanguage.includes("script") ? "javascript" : currentLanguage.includes("java") ? "java" : currentLanguage.includes("c++") || currentLanguage.includes("cpp") ? "cpp" : currentLanguage.includes("sql") ? "sql" : "python";
  const fileExt = monacoLang === "javascript" ? "js" : monacoLang === "java" ? "java" : monacoLang === "cpp" ? "cpp" : monacoLang === "sql" ? "sql" : "py";

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#0f172a" }}>
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column" style={{ marginLeft: "260px" }}>
        
        {/* Sub Header */}
        <div className="bg-slate-900 border-bottom border-slate-800 py-3 px-4 d-flex justify-content-between align-items-center sticky-top" style={{ backgroundColor: "#0f172a" }}>
          <div className="d-flex align-items-center gap-3">
            <h4 className="text-white fw-bold mb-0">{selectedCourse?.name || "Python Core"} Coding Lab</h4>
            <select 
              className="form-select form-select-sm bg-slate-800 border-slate-700 text-white w-auto"
              style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option>All</option>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
        </div>

        <div className="d-flex flex-grow-1 overflow-hidden" style={{ height: "calc(100vh - 65px)" }}>
          
          {/* Left Panel: Sidebar of Challenges */}
          <div className="bg-slate-900 border-end border-slate-800 overflow-auto" style={{ width: "300px", backgroundColor: "#0f172a", borderRight: "1px solid #1e293b" }}>
            {challenges.map(ch => {
              const isCompleted = history.some(h => h.challenge_id === ch.id && (h.status === "success" || h.status === "Passed"));
              return (
                <div 
                  key={ch.id}
                  onClick={() => handleSelectChallenge(ch)}
                  className={`p-3 border-bottom border-slate-800 cursor-pointer transition-all ${selectedChallenge?.id === ch.id ? "bg-slate-800 border-start border-4 border-indigo-500" : ""}`}
                  style={{ borderBottom: "1px solid #1e293b", cursor: "pointer", backgroundColor: selectedChallenge?.id === ch.id ? "#1e293b" : "transparent" }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className={`badge ${ch.difficulty === "Easy" ? "bg-success" : ch.difficulty === "Medium" ? "bg-warning text-dark" : "bg-danger"}`} style={{ fontSize: "10px" }}>{ch.difficulty}</span>
                    <span className="text-slate-500 small d-flex align-items-center gap-1">
                      <Zap size={11} className="text-warning fill-warning" /> {ch.xp_reward} XP
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between gap-1">
                    <h6 className="text-white mb-0 text-truncate" style={{ fontSize: "14px", fontWeight: "600" }}>{ch.title}</h6>
                    {isCompleted && <CheckCircle size={16} className="text-success fill-success flex-shrink-0" style={{ color: "#10b981" }} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Panel: Challenge & Editor */}
          <div className="flex-grow-1 d-flex flex-column overflow-hidden bg-slate-950" style={{ backgroundColor: "#020617" }}>
            <div className="p-4 overflow-auto" style={{ height: "40%", borderBottom: "1px solid #1e293b" }}>
              {selectedChallenge && (
                <>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h3 className="text-white fw-bold mb-0">{selectedChallenge.title}</h3>
                  </div>
                  <div className="text-slate-400 leading-relaxed mb-4" style={{ fontSize: "15px", color: "#94a3b8" }}>
                    {selectedChallenge.description}
                  </div>
                  
                  {showHint && (
                    <div className="bg-indigo-950 bg-opacity-35 p-3 rounded-3" style={{ border: "1px solid #4338ca", backgroundColor: "rgba(30, 27, 75, 0.4)" }}>
                      <div className="d-flex align-items-center gap-2 text-indigo-400 fw-bold small mb-2" style={{ color: "#818cf8" }}>
                        <Lightbulb size={16} /> HINTS
                      </div>
                      <ul className="mb-0 text-slate-300 small" style={{ listStyleType: "circle", paddingLeft: "20px" }}>
                        {selectedChallenge.hints && selectedChallenge.hints.map((h, i) => <li key={i} className="mb-1">{h}</li>)}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex-grow-1 bg-slate-900 p-0 d-flex flex-column" style={{ backgroundColor: "#0f172a" }}>
              <div className="bg-slate-800 px-4 py-2 d-flex justify-content-between align-items-center" style={{ backgroundColor: "#1e293b", borderBottom: "1px solid #334155" }}>
                <span className="text-slate-400 small fw-bold d-flex align-items-center gap-1" style={{ color: "#94a3b8" }}><Code size={14} /> solution.{fileExt}</span>
                <div className="d-flex gap-2">
                   <button onClick={() => setShowHint(!showHint)} className="btn btn-sm btn-outline-secondary border-0 text-slate-400 hover-text-white" style={{ outline: "none", boxShadow: "none", color: "#94a3b8" }}>
                     Hint
                   </button>
                   <button 
                     onClick={() => handleRunCode(false)} 
                     disabled={loading}
                     className="btn btn-sm btn-outline-light px-3 py-1 font-semibold"
                     style={{ border: "1px solid #475569", color: "#cbd5e1" }}
                    >
                     {loading ? <span className="spinner-border spinner-border-sm me-1"></span> : <><Play size={14} className="me-1" /> Run Code</>}
                   </button>
                   <button 
                     onClick={() => handleRunCode(true)} 
                     disabled={loading}
                     className="btn btn-sm btn-indigo px-4 py-1 font-semibold text-white d-flex align-items-center gap-1"
                     style={{ backgroundColor: "#4f46e5", border: "none" }}
                    >
                     {loading ? <span className="spinner-border spinner-border-sm"></span> : <><Trophy size={14} /> Submit</>}
                   </button>
                </div>
              </div>
              <div className="flex-grow-1 overflow-hidden position-relative">
                <Editor
                  height="100%"
                  language={monacoLang}
                  value={code}
                  onChange={value => setCode(value || "")}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    fontFamily: '"Fira Code", monospace',
                    minimap: { enabled: false },
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Panel: Output and Results */}
          <div className="bg-slate-900 border-start border-slate-800 overflow-auto" style={{ width: "380px", backgroundColor: "#0f172a", borderLeft: "1px solid #1e293b" }}>
            <div className="p-4">
              <h6 className="text-slate-500 uppercase fw-bold small mb-4" style={{ color: "#64748b", textTransform: "uppercase" }}>Output & Results</h6>
              
              {!results && (
                <div className="text-slate-650 text-center mt-5 py-5" style={{ color: "#475569" }}>
                  <Monitor size={36} className="d-block mx-auto mb-2 opacity-50" />
                  Run or Submit your code to see console results.
                </div>
              )}
              
              {results && (
                <div className="d-flex flex-column gap-4 animate-fadeln">
                  
                  {/* Validation Badge */}
                  {results.status === "not_supported" ? (
                    <div className="p-4 rounded-3 text-center border"
                      style={{ 
                        backgroundColor: "rgba(120, 53, 15, 0.2)",
                        borderColor: "#f59e0b",
                        color: "#fbbf24"
                      }}
                    >
                      <AlertCircle size={36} className="mb-2" />
                      <h5 className="fw-bold mb-1">Execution Notice</h5>
                      <div className="small">{results.message || "Live code execution is not yet supported for this language."}</div>
                    </div>
                  ) : results.status === "Executed" ? (
                    <div className="p-3 rounded-3 bg-slate-800 border border-slate-700 text-slate-300" style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}>
                      <div className="fw-semibold small uppercase text-slate-500 mb-1" style={{ color: "#94a3b8", fontSize: "11px" }}>RUN STATUS</div>
                      <div className="d-flex align-items-center gap-2 text-white fw-bold">
                        <Code size={18} className="text-indigo-400" /> Script Executed
                      </div>
                    </div>
                  ) : (
                    <div className={`p-4 rounded-3 text-center border ${results.status === "Passed" ? "bg-emerald-950 border-emerald-500 text-emerald-400" : "bg-rose-950 border-rose-500 text-rose-400"}`}
                      style={{ 
                        backgroundColor: results.status === "Passed" ? "rgba(6, 78, 59, 0.2)" : "rgba(136, 19, 55, 0.2)",
                        borderColor: results.status === "Passed" ? "#10b981" : "#f43f5e",
                        color: results.status === "Passed" ? "#34d399" : "#fb7185"
                      }}
                    >
                      {results.status === "Passed" ? (
                        <>
                          <CheckCircle size={36} className="mb-2" />
                          <h5 className="fw-bold mb-1">Passed</h5>
                          <div className="small mb-2">All assertion test cases passed successfully</div>
                          {results.xp_earned > 0 ? (
                            <div className="mt-2 fw-bold text-white bg-success rounded-pill px-3 py-1 d-inline-block small" style={{ backgroundColor: "#10b981" }}>
                              +{results.xp_earned} XP Recieved
                            </div>
                          ) : (
                            <span className="small text-muted d-block mt-2">Challenge already completed (+0 XP)</span>
                          )}
                        </>
                      ) : (
                        <>
                          <AlertCircle size={36} className="mb-2" />
                          <h5 className="fw-bold mb-1">Validation Failed</h5>
                          <div className="small">One or more compilation / output checks failed</div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Execution Metrics */}
                  <div className="row g-2">
                    <div className="col-6">
                      <div className="bg-slate-800 border border-slate-700 rounded-3 p-2 text-center" style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}>
                        <div className="text-slate-500 extra-small uppercase mb-1" style={{ color: "#94a3b8", fontSize: "10px" }}>Compile Time</div>
                        <div className="text-white fw-bold font-monospace small">{results.execution_time}s</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="bg-slate-800 border border-slate-700 rounded-3 p-2 text-center" style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}>
                        <div className="text-slate-500 extra-small uppercase mb-1" style={{ color: "#94a3b8", fontSize: "10px" }}>XP Reward</div>
                        <div className="text-white fw-bold font-monospace small">+{results.xp_earned} XP</div>
                      </div>
                    </div>
                  </div>

                  {/* Standard output logs console */}
                  <div className="bg-slate-950 rounded-3 border border-slate-800 p-3" style={{ backgroundColor: "#020617", borderColor: "#1e293b" }}>
                    <div className="fw-bold text-slate-500 extra-small uppercase mb-2" style={{ color: "#64748b", fontSize: "11px" }}>Stdout Logs Console</div>
                    <pre className="font-monospace text-slate-350 p-2 rounded bg-black overflow-auto small mb-0" style={{ maxHeight: "200px", border: "1px solid #1e293b", margin: 0, color: "#e2e8f0" }}>
                      {results.output || results.error || "No stdout output logs returned."}
                    </pre>
                  </div>

                  {/* Expected Outputs Comparison */}
                  {results.expected_output && (
                    <div className="bg-slate-950 rounded-3 border border-slate-800 p-3" style={{ backgroundColor: "#020617", borderColor: "#1e293b" }}>
                      <div className="fw-bold text-slate-500 extra-small uppercase mb-2" style={{ color: "#64748b", fontSize: "11px" }}>First Test Expected Output</div>
                      <pre className="font-monospace text-emerald-400 p-2 rounded bg-black overflow-auto small mb-0" style={{ border: "1px solid #1e293b", margin: 0, color: "#34d399" }}>
                        {results.expected_output}
                      </pre>
                    </div>
                  )}

                  {/* Breakdown of Test Cases */}
                  {results.status !== "Executed" && results.results && (
                    <div className="d-flex flex-column gap-3 mt-1">
                      <div className="text-slate-400 fw-bold small" style={{ color: "#cbd5e1" }}>Assertion Breakdown</div>
                      {results.results.map((r, i) => (
                        <div key={i} className="p-3 rounded-3 border bg-slate-800" style={{ backgroundColor: "#1e293b", borderColor: r.passed ? "rgba(16, 185, 129, 0.2)" : "rgba(244, 63, 94, 0.2)" }}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-slate-400 small fw-semibold" style={{ color: "#94a3b8" }}>Test Case #{i+1}</span>
                            <span className={`badge ${r.passed ? "bg-success" : "bg-danger"}`} style={{ fontSize: "10px" }}>{r.passed ? "Passed" : "Failed"}</span>
                          </div>
                          
                          <div className="mb-2">
                            <span className="text-slate-500 extra-small uppercase mb-1 d-block" style={{ fontSize: "9px" }}>Input Call</span>
                            <div className="font-monospace text-slate-300 small bg-slate-900 p-1 rounded" style={{ backgroundColor: "#0f172a", color: "#e2e8f0" }}>{r.input}</div>
                          </div>
                          
                          <div className="row g-2">
                            <div className="col-6">
                              <span className="text-slate-500 extra-small uppercase mb-1 d-block" style={{ fontSize: "9px" }}>Expected Return</span>
                              <div className="font-monospace text-success-light small bg-slate-900 p-1 rounded" style={{ backgroundColor: "#0f172a", color: "#34d399" }}>{r.expected}</div>
                            </div>
                            <div className="col-6">
                              <span className="text-slate-500 extra-small uppercase mb-1 d-block" style={{ fontSize: "9px" }}>Received Return / Error</span>
                              <div className={`font-monospace small bg-slate-900 p-1 rounded ${r.passed ? "text-success-light" : "text-danger"}`} style={{ backgroundColor: "#0f172a", color: r.passed ? "#34d399" : "#fb7185" }}>{r.error || r.received}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CodingPractice;