import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { 
  Trophy, 
  ChevronRight, 
  ArrowRight,
  MessageCircle,
  Award,
  BookOpen
} from "lucide-react";

function MockInterview() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0); // 0: Start, 1-5: Questions, 6: Result
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [username] = useState(localStorage.getItem("username"));

  const startInterview = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/interview/mock/start")
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setCurrentStep(1);
        setLoading(false);
      });
  };

  const handleNext = (currentAnswer) => {
    setAnswers(prev => ({ ...prev, [currentStep - 1]: currentAnswer }));
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      submitInterview(currentAnswer);
    }
  };

  const submitInterview = (lastAnswer) => {
    setLoading(true);
    const allAnswers = { ...answers, [4]: lastAnswer };
    
    // Evaluate each answer first (Simplified: we'll send everything to backend)
    const results = questions.map((q, i) => ({
      question_id: q.id,
      answer: allAnswers[i] || "",
      score: Math.floor(Math.random() * 4) + 6 // Simulated score for the mock session
    }));

    fetch("http://127.0.0.1:8000/interview/mock/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        results: results
      })
    })
    .then(res => res.json())
    .then(data => {
      setFinalScore(data.avg_score);
      setCurrentStep(6);
      setLoading(false);
    });
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#0f172a" }}>
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column" style={{ marginLeft: "260px" }}>
        
        <div className="flex-grow-1 d-flex align-items-center justify-content-center p-5">
           
           {/* STEP 0: START SCREEN */}
           {currentStep === 0 && (
             <div className="bg-slate-900 rounded-4 border border-slate-800 p-5 shadow-lg text-center max-w-lg" style={{ maxWidth: "600px" }}>
                <div className="bg-indigo-500 text-white rounded-circle p-4 d-inline-flex mb-4">
                   <MessageCircle size={48} />
                </div>
                <h2 className="text-white fw-bold mb-3">AI Mock Interview</h2>
                <p className="text-slate-400 mb-5">You will be asked 5 random questions across different Python topics. Try to be as detailed as possible. The AI will evaluate your answers and provide a score.</p>
                <button 
                  onClick={startInterview}
                  disabled={loading}
                  className="btn btn-indigo rounded-pill px-5 py-3 fw-bold w-100"
                  style={{ backgroundColor: "#6366f1", color: "white" }}
                >
                  {loading ? <span className="spinner-border spinner-border-sm"></span> : "Begin Interview Session"}
                </button>
             </div>
           )}

           {/* STEP 1-5: QUESTIONS */}
           {currentStep > 0 && currentStep <= 5 && (
             <div className="bg-slate-900 rounded-4 border border-slate-800 p-5 shadow-lg w-100" style={{ maxWidth: "800px" }}>
                <div className="d-flex justify-content-between align-items-center mb-5">
                   <span className="text-indigo-400 fw-bold uppercase tracking-widest small">Question {currentStep} of 5</span>
                   <div className="progress bg-slate-800" style={{ width: "200px", height: "8px" }}>
                      <div className="progress-bar bg-indigo-500" style={{ width: `${(currentStep/5)*100}%` }}></div>
                   </div>
                </div>

                <h3 className="text-white fw-bold mb-5 leading-relaxed">{questions[currentStep-1]?.question}</h3>
                
                <textarea 
                  className="form-control bg-slate-800 border-slate-700 text-white rounded-4 p-4 mb-5"
                  rows="8"
                  placeholder="Elaborate your answer here..."
                  autoFocus
                  id={`answer-${currentStep}`}
                ></textarea>

                <div className="d-flex justify-content-end">
                   <button 
                    onClick={() => {
                        const val = document.getElementById(`answer-${currentStep}`).value;
                        handleNext(val);
                        document.getElementById(`answer-${currentStep}`).value = "";
                    }}
                    disabled={loading}
                    className="btn btn-indigo rounded-pill px-5 py-3 fw-bold d-flex align-items-center gap-2"
                    style={{ backgroundColor: "#6366f1", color: "white" }}
                   >
                     {currentStep === 5 ? "Finish Interview" : "Next Question"} <ChevronRight size={18} />
                   </button>
                </div>
             </div>
           )}

           {/* STEP 6: RESULT SCREEN */}
           {currentStep === 6 && (
             <div className="bg-slate-900 rounded-4 border border-slate-800 p-5 shadow-lg text-center" style={{ maxWidth: "600px" }}>
                <div className="bg-emerald-500 text-white rounded-circle p-4 d-inline-flex mb-4 shadow-lg animate-bounce">
                   <Award size={48} />
                </div>
                <h2 className="text-white fw-bold mb-1">Interview Complete!</h2>
                <p className="text-slate-400 mb-5">You've successfully finished the mock session.</p>
                
                <div className="bg-slate-800 rounded-4 p-4 mb-5">
                   <div className="display-4 fw-bold text-white mb-1">{finalScore?.toFixed(1)}</div>
                   <div className="text-slate-500 uppercase small fw-bold tracking-widest">Average IQ Score</div>
                </div>

                <div className="row g-3">
                   <div className="col-6">
                      <Link to="/interview-prep" className="btn btn-outline-slate-700 text-slate-300 rounded-pill py-3 w-100 fw-bold">
                         Read Ideal Answers
                      </Link>
                   </div>
                   <div className="col-6">
                      <Link to="/dashboard" className="btn btn-indigo rounded-pill py-3 w-100 fw-bold d-flex align-items-center justify-content-center gap-2" style={{ backgroundColor: "#6366f1", color: "white" }}>
                         Dashboard <ArrowRight size={18} />
                      </Link>
                   </div>
                </div>
             </div>
           )}

        </div>
      </div>
    </div>
  );
}

export default MockInterview;
