import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Sparkles, Brain, AlertCircle, Loader2 } from "lucide-react";
import { useCourse } from "../context/CourseContext";

function InterviewGenerator() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState("Beginner");
  const [numQuestions, setNumQuestions] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [interviewData, setInterviewData] = useState(null);
  const { selectedCourse } = useCourse();
  
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!username) {
      navigate("/");
    }
  }, [username, navigate]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInterviewData(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/interview/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          difficulty: difficulty,
          number_of_questions: parseInt(numQuestions),
          course_id: selectedCourse?.id || "python-core"
        }),
      });

      if (!response.ok) {
        const errDetail = await response.json();
        throw new Error(errDetail.detail || "Failed to generate interview. Please try again.");
      }

      const data = await response.json();
      setInterviewData(data);
      if (data.interview_id) {
        localStorage.setItem("active_interview_id", data.interview_id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case "Technical": return "bg-primary-subtle text-primary border border-primary-subtle";
      case "Coding": return "bg-success-subtle text-success border border-success-subtle";
      case "Scenario": return "bg-warning-subtle text-warning-emphasis border border-warning-subtle";
      case "Behavioral": return "bg-info-subtle text-info-emphasis border border-info-subtle";
      default: return "bg-secondary-subtle text-secondary";
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Sidebar />
      <div className="flex-grow-1 p-5" style={{ marginLeft: "260px" }}>
        
        {/* Header summary */}
        <div className="d-flex align-items-center justify-content-between mb-5 bg-white p-4 rounded-4 shadow-sm border border-0">
          <div className="d-flex align-items-center gap-3">
            <div className="p-3 bg-primary-subtle rounded-3 text-primary">
              <Brain size={32} />
            </div>
            <div>
              <h1 className="h3 fw-bold text-slate-800 m-0">AI Mock Interview Generator 🧠</h1>
              <p className="text-secondary small m-0 mt-1">
                Generates personalized mock interview questions focused on your weaknesses and strong topics.
              </p>
            </div>
          </div>
        </div>

        {/* Generator Controls */}
        <div className="card border-0 shadow-sm rounded-4 mb-5 p-4 bg-white">
          <h2 className="h5 fw-bold text-slate-800 mb-4 d-flex align-items-center gap-2">
            <Sparkles size={20} className="text-warning" /> Configure Practice Session
          </h2>
          <form onSubmit={handleGenerate} className="row g-4 align-items-end">
            <div className="col-12 col-md-5">
              <label htmlFor="difficultySelect" className="form-label fw-semibold text-secondary small">
                Target Difficulty
              </label>
              <select 
                id="difficultySelect" 
                className="form-select border-slate-200 rounded-3 py-2"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            
            <div className="col-12 col-md-4">
              <label htmlFor="numberSelect" className="form-label fw-semibold text-secondary small">
                Number of Questions
              </label>
              <select 
                id="numberSelect" 
                className="form-select border-slate-200 rounded-3 py-2"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
              </select>
            </div>
            
            <div className="col-12 col-md-3">
              <button 
                type="submit" 
                className="btn btn-primary w-100 rounded-3 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="spinner-border spinner-border-sm" role="status" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Interview
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-secondary mt-3">Synthesizing personal skill profile with Gemini AI...</p>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-3 border-0 shadow-sm rounded-3 p-3 mb-5" role="alert">
            <AlertCircle size={24} className="text-danger" />
            <div>
              <span className="fw-semibold">Generation Failed:</span> {error}
            </div>
          </div>
        )}

        {/* Questions Display Grid */}
        {interviewData && !loading && (
          <div>
            {/* Start Live Session Banner */}
            <div className="card bg-primary-subtle border-0 rounded-4 p-4 mb-4 d-flex flex-wrap align-items-center justify-content-between flex-row gap-3">
              <div>
                <h4 className="fw-bold text-primary mb-1">Session Ready! 🚀</h4>
                <p className="text-secondary small mb-0">Your personalized questions have been prepared based on your profile.</p>
              </div>
              <button 
                className="btn btn-primary rounded-3 px-4 py-2.5 fw-bold"
                onClick={() => navigate(`/interview-session/${interviewData.interview_id}`, { state: { interviewId: interviewData.interview_id } })}
              >
                Start Live Interview Session
              </button>
            </div>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h3 className="h5 fw-bold text-slate-800 m-0">Your Personalized Questions</h3>
              <span className="badge bg-secondary-subtle text-secondary-emphasis px-3 py-2 rounded-pill fw-semibold">
                {interviewData.difficulty} • {interviewData.total_questions} Questions
              </span>
            </div>
            
            <div className="row g-4">
              {interviewData.questions.map((q, idx) => (
                <div key={idx} className="col-12">
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white transition hover-shadow position-relative overflow-hidden">
                    <div className="d-flex align-items-start gap-4">
                      {/* Quest Number block */}
                      <div className="d-flex flex-column align-items-center justify-content-center bg-light text-slate-700 fw-bold rounded-3" style={{ width: "50px", height: "50px", minWidth: "50px" }}>
                        <span className="small text-muted mb-0 lh-1">Q</span>
                        <span className="fs-5 lh-1">{idx + 1}</span>
                      </div>
                      
                      {/* Topic, badges, explanation block */}
                      <div className="flex-grow-1">
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                          <span className={`badge px-3 py-1.5 rounded-pill text-xs fw-semibold ${getBadgeColor(q.type)}`}>
                            {q.type}
                          </span>
                          <span className="badge bg-light text-dark border border-slate-200 px-3 py-1.5 rounded-pill text-xs fw-semibold">
                            Topic: {q.topic}
                          </span>
                        </div>
                        <p className="fs-5 text-slate-800 fw-semibold mb-0" style={{ whiteSpace: "pre-line" }}>
                          {q.question}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default InterviewGenerator;
