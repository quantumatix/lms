import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { 
  MessageSquare, 
  ChevronRight, 
  Star, 
  Brain, 
  Cpu, 
  UserCheck,
  Globe
} from "lucide-react";

function InterviewPrep() {
  const [questions, setQuestions] = useState([]);
  const [category, setCategory] = useState("Beginner");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/interview/questions?category=${category}`)
      .then(res => res.json())
      .then(data => setQuestions(data));
  }, [category]);

  const handleEvaluate = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/interview/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question_id: selectedQuestion.id,
        answer: answer
      })
    })
    .then(res => res.json())
    .then(data => {
      setEvaluation(data);
      setLoading(false);
    });
  };

  const categories = [
    { name: "Beginner", icon: <Star className="text-success" />, desc: "The essentials." },
    { name: "Intermediate", icon: <Brain className="text-warning" />, desc: "Logic & Patterns." },
    { name: "Advanced", icon: <Cpu className="text-danger" />, desc: "Internals & Optimization." },
    { name: "System Design", icon: <Globe className="text-primary" />, desc: "Architectural Thinking." }
  ];

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Sidebar />
      <div className="flex-grow-1" style={{ marginLeft: "260px" }}>
        
        {/* Header */}
        <div className="bg-white border-bottom py-4 px-5 shadow-sm">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1 text-dark" style={{ letterSpacing: "-1px" }}>Interview Preparation</h2>
              <p className="text-muted mb-0">Master Python concepts and ace your technical interviews.</p>
            </div>
            <Link to="/mock-interview" className="btn btn-primary rounded-pill px-4 py-3 fw-bold shadow-lg d-flex align-items-center gap-2">
              <UserCheck size={20} /> Start Mock Interview
            </Link>
          </div>
        </div>

        <div className="p-5">
          
          <div className="row g-4">
            {/* Sidebar of Categories */}
            <div className="col-lg-3">
              <div className="d-flex flex-column gap-2">
                {categories.map(c => (
                  <div 
                    key={c.name}
                    onClick={() => { setCategory(c.name); setSelectedQuestion(null); setEvaluation(null); }}
                    className={`p-4 rounded-4 border transition-all cursor-pointer ${category === c.name ? "bg-white shadow-sm border-primary border-2" : "bg-light-subtle hover-bg-white border-transparent"}`}
                  >
                    <div className="d-flex align-items-center gap-3 mb-2">
                      {c.icon}
                      <h6 className="fw-bold mb-0 text-dark">{c.name}</h6>
                    </div>
                    <p className="text-muted small mb-0">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Question List or Detail */}
            <div className="col-lg-9">
              {!selectedQuestion ? (
                <div className="bg-white rounded-4 border shadow-sm overflow-hidden p-2">
                  {questions.map((q, i) => (
                    <div 
                      key={q.id}
                      onClick={() => { setSelectedQuestion(q); setAnswer(""); setEvaluation(null); }}
                      className="p-4 border-bottom last-border-0 hover-bg-light transition-all cursor-pointer d-flex justify-content-between align-items-center"
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div className="text-muted small fw-bold">Q{i+1}</div>
                        <h6 className="fw-bold mb-0 text-dark">{q.question}</h6>
                      </div>
                      <ChevronRight size={18} className="text-muted" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="animate-fadeln">
                  <button onClick={() => setSelectedQuestion(null)} className="btn btn-link text-primary text-decoration-none fw-bold p-0 mb-4">
                    ← Back to Question List
                  </button>
                  
                  <div className="bg-white rounded-4 border shadow-sm p-5">
                     <span className="badge bg-primary-subtle text-primary mb-3">{category} Level</span>
                     <h3 className="fw-bold text-dark mb-4">{selectedQuestion.question}</h3>
                     
                     <div className="mb-4">
                        <label className="form-label text-muted small fw-bold uppercase">Your Answer</label>
                        <textarea 
                          className="form-control rounded-4 p-4 border-light-subtle" 
                          rows="6" 
                          placeholder="Type your detailed explanation here..."
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                        ></textarea>
                     </div>

                     <div className="d-flex justify-content-end">
                        <button 
                          onClick={handleEvaluate}
                          disabled={!answer || loading}
                          className="btn btn-dark rounded-pill px-5 py-3 fw-bold d-flex align-items-center gap-2"
                        >
                           {loading ? <span className="spinner-border spinner-border-sm"></span> : <><MessageSquare size={18} /> Submit for Evaluation</>}
                        </button>
                     </div>
                  </div>

                  {evaluation && (
                    <div className="mt-5 animate-slideInUp">
                      <div className="row g-4">
                        <div className="col-md-4">
                           <div className="bg-white rounded-4 border shadow-sm p-4 text-center h-100">
                              <h1 className="display-3 fw-bold text-primary mb-1">{evaluation.score}</h1>
                              <div className="text-muted small uppercase fw-bold">Score out of 10</div>
                              <div className={`mt-3 badge rounded-pill px-3 py-2 ${evaluation.score >= 7 ? "bg-success" : "bg-warning"}`}>
                                 {evaluation.score >= 7 ? "Excellent Effort!" : "Progressive Effort"}
                              </div>
                           </div>
                        </div>
                        <div className="col-md-8">
                           <div className="bg-success-light rounded-4 border border-success border-opacity-10 p-4 h-100" style={{ backgroundColor: "#f0fdf4" }}>
                              <h6 className="fw-bold text-success mb-3 d-flex align-items-center gap-2">
                                 <UserCheck size={18} /> Ideal Answer
                              </h6>
                              <div className="text-success-emphasis small leading-relaxed">
                                {evaluation.ideal_answer}
                              </div>
                           </div>
                        </div>
                      </div>

                      {evaluation.missing_points && evaluation.missing_points.length > 0 && (
                        <div className="mt-4 bg-white rounded-4 border border-warning border-opacity-30 p-5 shadow-sm">
                           <h6 className="fw-bold text-warning mb-4 d-flex align-items-center gap-2">
                              <Brain size={20} /> Missing Key Points
                           </h6>
                           <div className="row g-3">
                              {evaluation.missing_points.map((p, i) => (
                                <div key={i} className="col-md-6 d-flex gap-3">
                                   <div className="bg-warning text-white rounded-circle p-1 flex-shrink-0" style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>!</div>
                                   <div className="text-secondary small">{p}</div>
                                </div>
                              ))}
                           </div>
                        </div>
                      )}
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

export default InterviewPrep;
