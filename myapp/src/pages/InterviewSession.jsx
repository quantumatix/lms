import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useParams, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Brain, Clock, ArrowLeft, ArrowRight, Save, CheckCircle2, AlertCircle } from "lucide-react";

function InterviewSession() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { interviewId: routeInterviewId } = useParams();
  const location = useLocation();

  const queryInterviewId = searchParams.get("id");
  const stateInterviewId = location.state?.interviewId;
  const localInterviewId = localStorage.getItem("active_interview_id");

  const interviewId = routeInterviewId || queryInterviewId || stateInterviewId || localInterviewId;
  const username = localStorage.getItem("username");
  
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  
  // Timer State (30 minutes default)
  const [timeLeft, setTimeLeft] = useState(1800);
  const [timeExpired, setTimeExpired] = useState(false);
  const timerRef = useRef(null);

  // Redirection checks
  useEffect(() => {
    if (!username) {
      navigate("/");
      return;
    }
    if (!interviewId) {
      setError("No active Interview Session ID provided. Please generate an interview first.");
      setLoading(false);
      return;
    }

    // Fetch session details
    const loadSession = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/interview/session/${interviewId}`);
        if (!res.ok) {
          throw new Error("Unable to retrieve interview session details.");
        }
        const data = await res.json();
        setSession(data);
        if (data.interview_id) {
          localStorage.setItem("active_interview_id", data.interview_id);
        }
        
        // Fetch saved answers from interview_answers collection for this session
        const answersRes = await fetch(`http://127.0.0.1:8000/interview/session/${interviewId}/answers?username=${username}`);
        if (answersRes.ok) {
          const savedAnswers = await answersRes.json();
          const answersDict = {};
          savedAnswers.forEach(item => {
            answersDict[item.question_number] = item.student_answer;
          });
          setAnswers(answersDict);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [interviewId, username, navigate]);

  // Countdown timer effect
  useEffect(() => {
    if (loading || error || timeExpired) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimeExpired(true);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, error, timeExpired]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTextChange = (e) => {
    if (timeExpired) return;
    const currentQuestionNum = currentIdx + 1;
    setAnswers(prev => ({
      ...prev,
      [currentQuestionNum]: e.target.value
    }));
  };

  const handleSaveAnswer = async () => {
    if (timeExpired) return;
    const currentQuestionNum = currentIdx + 1;
    const studentAnswer = answers[currentQuestionNum] || "";

    try {
      const res = await fetch("http://127.0.0.1:8000/interview/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          interview_id: interviewId,
          question_number: currentQuestionNum,
          username: username,
          answer: studentAnswer
        })
      });

      if (!res.ok) {
        throw new Error("Unable to save answer to local database.");
      }
      
      const saveBtn = document.getElementById("save-indicator");
      if (saveBtn) {
        saveBtn.innerText = "Answer Saved!";
        saveBtn.classList.remove("text-secondary");
        saveBtn.classList.add("text-success", "fw-bold");
        setTimeout(() => {
          saveBtn.innerText = "All inputs saved locally";
          saveBtn.classList.remove("text-success", "fw-bold");
          saveBtn.classList.add("text-secondary");
        }, 1500);
      }

    } catch (err) {
      alert("Failed to save answer: " + err.message);
    }
  };

  const handlePrevious = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleNext = () => {
    if (session && currentIdx < session.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const submitAndEvaluate = async () => {
    setSubmitting(true);
    setSubmitStatus("Saving final answer...");
    await handleSaveAnswer();
    
    setSubmitStatus("Gemini AI is evaluating your responses... This may take up to 20-30 seconds.");
    try {
      const res = await fetch("http://127.0.0.1:8000/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interview_id: interviewId, username: username })
      });
      if (!res.ok) {
        throw new Error("Failed to evaluate interview answers");
      }
      const data = await res.json();
      setSubmitting(false);
      navigate(`/interview-result/${interviewId}`, { state: { evaluation: data } });
    } catch (err) {
      alert("Error evaluating interview: " + err.message);
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    alert("Time is up! Submitting active interview session answers immediately.");
    await submitAndEvaluate();
  };

  const handleFinishInterview = async () => {
    if (window.confirm("Are you sure you want to finish the interview and submit your answers?")) {
      await submitAndEvaluate();
    }
  };

  if (submitting) {
    return (
      <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <Sidebar />
        <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center" style={{ marginLeft: "260px" }}>
          <div className="spinner-border text-primary mb-3" style={{ width: "3.5rem", height: "3.5rem" }} role="status">
            <span className="visually-hidden">Evaluating...</span>
          </div>
          <h4 className="fw-bold text-slate-800">{submitStatus}</h4>
          <p className="text-secondary small">Evaluating code answers, technical definitions, and communication style...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <Sidebar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center" style={{ marginLeft: "260px" }}>
          <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <Sidebar />
        <div className="flex-grow-1 p-5 d-flex align-items-center justify-content-center" style={{ marginLeft: "260px" }}>
          <div className="card shadow-sm border-0 text-center p-5 bg-white rounded-4" style={{ maxWidth: "500px" }}>
            <div className="text-danger mb-4">
              <AlertCircle size={64} />
            </div>
            <h4 className="fw-bold text-slate-800 mb-2">No Active Session</h4>
            <p className="text-secondary small mb-4">{error || "Please retrieve a session ID."}</p>
            <button 
              className="btn btn-primary rounded-3 px-4 py-2"
              onClick={() => navigate("/interview-generator")}
            >
              Generate Mock Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentIdx];
  const progressPercent = ((currentIdx + 1) / session.total_questions) * 100;

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Sidebar />
      <div className="flex-grow-1 p-5" style={{ marginLeft: "260px" }}>
        
        {/* Top Header & Alert Session Timer */}
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 bg-white p-4 rounded-4 shadow-sm border-0">
          <div>
            <h1 className="h4 fw-bold text-slate-800 m-0">Python Mock Interview Session 💻</h1>
            <p className="text-muted small m-0 mt-1">Difficulty: {session.difficulty} • Username: {session.username}</p>
          </div>
          
          <div className="d-flex align-items-center gap-2 bg-light border border-slate-200 px-4 py-2.5 rounded-3">
            <Clock size={18} className={timeLeft < 300 ? "text-danger animate-pulse" : "text-primary"} />
            <div>
              <span className="text-muted small fw-semibold block lh-1">Remaining Time</span>
              <span className={`block fs-5 fw-bold font-monospace lh-1 ${timeLeft < 300 ? "text-danger" : "text-dark"}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar info */}
        <div className="mb-4">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-slate-700 fw-semibold small">Question {currentIdx + 1} of {session.total_questions}</span>
            <span className="text-secondary small">{Math.round(progressPercent)}% Completed</span>
          </div>
          <div className="progress rounded-pill shadow-sm" style={{ height: "8px" }}>
            <div 
              className="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
              role="progressbar" 
              style={{ width: `${progressPercent}%` }}
              aria-valuenow={progressPercent} 
              aria-valuemin="0" 
              aria-valuemax="100"
            />
          </div>
        </div>

        {/* Question Panel */}
        <div className="card shadow-sm border-0 rounded-4 p-4 bg-white mb-4">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1.5 rounded-pill text-xs fw-semibold">
              Type: {currentQuestion.type}
            </span>
            <span className="badge bg-light text-slate-700 border border-slate-200 px-3 py-1.5 rounded-pill text-xs fw-semibold">
              Topic: {currentQuestion.topic}
            </span>
          </div>

          <h3 className="h5 fw-bold text-slate-800 mb-4" style={{ lineHeight: "1.6" }}>
            {currentQuestion.question}
          </h3>

          <div className="mb-4">
            <label htmlFor="answerInput" className="form-label text-secondary fw-semibold small mb-2">
              Your Answer
            </label>
            <textarea
              id="answerInput"
              className="form-control border-slate-200 rounded-3 p-3 font-monospace"
              style={{ minHeight: "180px", resize: "vertical", fontSize: "14px" }}
              value={answers[currentIdx + 1] || ""}
              onChange={handleTextChange}
              placeholder="Type your explanation or coding response here..."
              disabled={timeExpired}
            />
          </div>

          {/* Action Row */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-secondary rounded-3 px-4 py-2 d-flex align-items-center gap-2"
                onClick={handlePrevious}
                disabled={currentIdx === 0}
              >
                <ArrowLeft size={16} /> Previous
              </button>
              <button 
                className="btn btn-outline-secondary rounded-3 px-4 py-2 d-flex align-items-center gap-2"
                onClick={handleNext}
                disabled={currentIdx === session.total_questions - 1}
              >
                Next <ArrowRight size={16} />
              </button>
            </div>

            <div className="d-flex align-items-center gap-3">
              <span id="save-indicator" className="text-secondary small font-monospace">All inputs saved locally</span>
              <button 
                className="btn btn-emerald bg-success text-white rounded-3 px-4 py-2 d-flex align-items-center gap-2"
                onClick={handleSaveAnswer}
                disabled={timeExpired}
              >
                <Save size={16} /> Save Answer
              </button>
            </div>
          </div>
        </div>

        {/* Finishing Session Action Card */}
        {currentIdx === session.total_questions - 1 && (
          <div className="card shadow-sm border-0 rounded-4 p-4 text-center bg-white border border-success-subtle">
            <CheckCircle2 size={40} className="text-success mx-auto mb-3" />
            <h4 className="fw-bold text-slate-800 mb-2">You've reached the end!</h4>
            <p className="text-secondary small mb-4">Make sure you have clicked "Save Answer" for all your questions before completing the interview.</p>
            <button 
              className="btn btn-primary rounded-3 px-5 py-2.5 fw-bold shadow"
              onClick={handleFinishInterview}
            >
              Finish Interview & Request AI Evaluation
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default InterviewSession;
