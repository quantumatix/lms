import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { 
  ArrowLeft, Award, Calendar, MessageSquare, ShieldAlert, BookOpen, 
  Sparkles, CheckCircle2, AlertCircle, Heart, Star, Compass
} from "lucide-react";

function InterviewResult() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username");

  const [evaluation, setEvaluation] = useState(location.state?.evaluation || null);
  const [loading, setLoading] = useState(!evaluation);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) {
      navigate("/");
      return;
    }

    if (evaluation) {
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/interview/result/${interviewId}?username=${username}`);
        if (!res.ok) {
          throw new Error("Unable to retrieve evaluation report. It may still be generating.");
        }
        const data = await res.json();
        setEvaluation(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [interviewId, username, evaluation, navigate]);

  if (loading) {
    return (
      <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <Sidebar />
        <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center" style={{ marginLeft: "260px" }}>
          <div className="spinner-border text-primary mb-3" style={{ width: "3.5rem", height: "3.5rem" }} role="status">
            <span className="visually-hidden">Loading Report...</span>
          </div>
          <h5 className="fw-semibold text-slate-800">Fetching Interview Report</h5>
        </div>
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <Sidebar />
        <div className="flex-grow-1 p-5 d-flex align-items-center justify-content-center" style={{ marginLeft: "260px" }}>
          <div className="card shadow-sm border-0 text-center p-5 bg-white rounded-4" style={{ maxWidth: "500px" }}>
            <div className="text-danger mb-4">
              <ShieldAlert size={64} />
            </div>
            <h4 className="fw-bold text-slate-800 mb-2">Report Not Found</h4>
            <p className="text-secondary small mb-4">{error || "This interview evaluation report is unavailable."}</p>
            <button 
              className="btn btn-primary rounded-3 px-4 py-2"
              onClick={() => navigate("/interview-results")}
            >
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  const evalDate = new Date(evaluation.evaluated_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const ratingItem = (label, score, maxScore = 10, colorClass = "bg-primary") => {
    const percentage = (score / maxScore) * 100;
    return (
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="small fw-semibold text-secondary">{label}</span>
          <span className="small fw-bold text-dark">{score} / {maxScore}</span>
        </div>
        <div className="progress rounded-pill shadow-none" style={{ height: "8px" }}>
          <div 
            className={`progress-bar rounded-pill ${colorClass}`} 
            role="progressbar" 
            style={{ width: `${percentage}%` }}
            aria-valuenow={score} 
            aria-valuemin="0" 
            aria-valuemax={maxScore}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Sidebar />
      <div className="flex-grow-1 p-5" style={{ marginLeft: "260px" }}>
        
        {/* Navigation back and header */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <button 
            className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center p-2"
            onClick={() => navigate("/interview-results")}
            style={{ width: "36px", height: "36px" }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="h4 fw-bold text-slate-800 m-0">Evaluation Report</h1>
            <p className="text-muted small m-0">Generated on {evalDate}</p>
          </div>
        </div>

        {/* Main Executive Summary Panel */}
        <div className="row g-4 mb-5">
          {/* Left Panel: Score and Rating Sliders */}
          <div className="col-12 col-lg-5">
            <div className="card shadow-sm border-0 p-4 rounded-4 bg-white h-100">
              <div className="text-center mb-4">
                <h5 className="fw-bold text-slate-800 mb-3" style={{ fontSize: "15px" }}>Overall Competency Score</h5>
                <div 
                  className="d-inline-flex flex-column align-items-center justify-content-center rounded-circle my-1 position-relative"
                  style={{
                    width: "150px",
                    height: "150px",
                    background: `conic-gradient(#4f46e5 ${evaluation.percentage}%, #f1f5f9 ${evaluation.percentage}% 100%)`,
                    padding: "12px"
                  }}
                >
                  <div 
                    className="d-flex flex-column align-items-center justify-content-center rounded-circle bg-white w-100 h-100"
                    style={{ zIndex: 2 }}
                  >
                    <span className="fs-1 fw-bold text-dark m-0 leading-none">{evaluation.overall_score}</span>
                    <span className="text-secondary small fw-medium mt-1">PERCENT GRADE</span>
                  </div>
                </div>
              </div>

              <hr className="my-4 text-muted" />

              <h6 className="fw-bold text-slate-800 mb-3" style={{ fontSize: "13px" }}>Categorized Skill Ratings</h6>
              {ratingItem("Communication Skills", evaluation.communication, 10, "bg-primary")}
              {ratingItem("Technical Knowledge", evaluation.technical_knowledge, 10, "bg-success")}
              {ratingItem("Problem Solving", evaluation.problem_solving, 10, "bg-warning text-dark")}
              {ratingItem("Confidence Level", evaluation.confidence, 10, "bg-info text-dark")}
            </div>
          </div>

          {/* Right Panel: Strengths, Weak Areas, Recommendations, AI summary */}
          <div className="col-12 col-lg-7">
            <div className="card shadow-sm border-0 p-4 rounded-4 bg-white h-100 d-flex flex-column">
              <div className="mb-4">
                <h5 className="fw-bold text-slate-800 mb-3 d-flex align-items-center gap-2" style={{ fontSize: "15px" }}>
                  <Sparkles className="text-warning" size={18} />
                  AI Summary Feedback
                </h5>
                <p className="text-muted small lh-lg m-0 p-3 bg-light rounded-3" style={{ fontStyle: "italic" }}>
                  "{evaluation.summary}"
                </p>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6">
                  <h6 className="fw-bold text-success mb-2 d-flex align-items-center gap-2" style={{ fontSize: "13px" }}>
                    <CheckCircle2 size={16} />
                    Verified Strengths
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {evaluation.strengths && evaluation.strengths.length > 0 ? (
                      evaluation.strengths.map((str, i) => (
                        <span key={i} className="badge bg-success-subtle text-success px-2.5 py-1.5 rounded-3 border border-success-subtle small fw-medium">
                          {str}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted small">No specific strength tags computed.</span>
                    )}
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <h6 className="fw-bold text-danger mb-2 d-flex align-items-center gap-2" style={{ fontSize: "13px" }}>
                    <AlertCircle size={16} />
                    Weak Areas to Improve
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {evaluation.weak_areas && evaluation.weak_areas.length > 0 ? (
                      evaluation.weak_areas.map((weak, i) => (
                        <span key={i} className="badge bg-danger-subtle text-danger px-2.5 py-1.5 rounded-3 border border-danger-subtle small fw-medium">
                          {weak}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted small">No weaknesses identified. Excellent!</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <h6 className="fw-bold text-slate-800 mb-2 d-flex align-items-center gap-2" style={{ fontSize: "13px" }}>
                  <BookOpen className="text-primary" size={16} />
                  Recommended Topics to Revise
                </h6>
                <ul className="m-0 ps-3 text-secondary small lh-lg">
                  {evaluation.recommended_topics && evaluation.recommended_topics.length > 0 ? (
                    evaluation.recommended_topics.map((topic, i) => (
                      <li key={i}>{topic}</li>
                    ))
                  ) : (
                    <li>Keep practicing general core concepts!</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Question Evaluations Accordion Panel */}
        <h5 className="fw-bold text-slate-800 mb-4 px-2" style={{ fontSize: "16px" }}>Detailed Q&A Transcript Breakdown</h5>
        
        <div className="d-flex flex-column gap-4">
          {evaluation.question_feedback && evaluation.question_feedback.map((item, idx) => {
            const isGoodScore = item.score >= 8;
            const isMidScore = item.score >= 5;
            
            return (
              <div 
                key={idx} 
                className="card shadow-sm border-0 rounded-4 overflow-hidden" 
                style={{ borderLeft: `5px solid ${isGoodScore ? "#198754" : (isMidScore ? "#ffc107" : "#dc3545")}` }}
              >
                {/* Question Info Header */}
                <div className="card-header bg-white py-3 px-4 d-flex flex-wrap align-items-center justify-content-between border-bottom-0">
                  <div className="d-flex align-items-center gap-2">
                    <span 
                      className="badge bg-secondary-subtle text-secondary px-2.5 py-1.5 rounded-3 small fw-bold"
                    >
                      Question {item.question_number}
                    </span>
                  </div>
                  <div>
                    <span 
                      className={`badge px-2.5 py-1.5 rounded-pill small fw-bold ${
                        isGoodScore ? "bg-success-subtle text-success" : (isMidScore ? "bg-warning-subtle text-warning-emphasis" : "bg-danger-subtle text-danger")
                      }`}
                    >
                      Score: {item.score} / {item.max_score}
                    </span>
                  </div>
                </div>

                <div className="card-body px-4 py-3">
                  {/* The Question Text */}
                  <h6 className="fw-bold text-slate-800 mb-3" style={{ fontSize: "14px", lineHeight: "1.5" }}>
                    {item.question}
                  </h6>
                  
                  {/* Student Answer */}
                  <div className="mb-4">
                    <div className="small fw-semibold text-secondary mb-1">Your Submission</div>
                    <pre 
                      className="p-3 bg-light rounded-3 font-monospace text-dark m-0 small" 
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {item.student_answer ? item.student_answer : "[No answer submitted]"}
                    </pre>
                  </div>

                  <div className="row g-3">
                    {/* Gemini AI feedback */}
                    <div className="col-12 col-md-6">
                      <div className="h-100 p-3 rounded-3 bg-light-subtle border">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <MessageSquare className="text-primary animate-pulse" size={16} />
                          <span className="small fw-bold text-indigo-700">AI Evaluation Feedback</span>
                        </div>
                        <p className="text-secondary small m-0 lh-base">
                          {item.feedback}
                        </p>
                      </div>
                    </div>

                    {/* Gemini AI improvement tip */}
                    <div className="col-12 col-md-6">
                      <div className="h-100 p-3 rounded-3 bg-light-subtle border">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <Compass className="text-success" size={16} />
                          <span className="small fw-bold text-teal-700">Actionable Improvement Tips</span>
                        </div>
                        <p className="text-secondary small m-0 lh-base text-teal-900">
                          {item.improvement}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default InterviewResult;
