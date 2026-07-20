import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FileText, Calendar, ChevronRight, Award, AlertCircle, Sparkles } from "lucide-react";

function InterviewResults() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) {
      navigate("/");
      return;
    }

    const fetchResults = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/interview/results?username=${username}`);
        if (!res.ok) {
          throw new Error("Failed to load interview results.");
        }
        const data = await res.json();
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [username, navigate]);

  if (loading) {
    return (
      <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <Sidebar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center" style={{ marginLeft: "260px" }}>
          <div className="spinner-border text-primary" style={{ width: "3.5rem", height: "3.5rem" }} role="status">
            <span className="visually-hidden">Loading Reports...</span>
          </div>
        </div>
      </div>
    );
  }

  // Calculate high-level stats
  const totalInterviews = results.length;
  const averageScore = totalInterviews > 0
    ? Math.round(results.reduce((acc, curr) => acc + curr.overall_score, 0) / totalInterviews)
    : 0;

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Sidebar />
      <div className="flex-grow-1 p-5" style={{ marginLeft: "260px" }}>
        
        {/* Header Block */}
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 bg-white p-4 rounded-4 shadow-sm border-0">
          <div>
            <h1 className="h4 fw-bold text-slate-800 m-0 d-flex align-items-center gap-2">
              <FileText className="text-primary" size={24} />
              AI Interview Reports 📋
            </h1>
            <p className="text-muted small m-0 mt-1">Review feedback, grades, and recommended revisions from all past mock sessions.</p>
          </div>
          <button 
            className="btn btn-primary rounded-3 d-flex align-items-center gap-2"
            onClick={() => navigate("/interview-generator")}
          >
            <Sparkles size={16} />
            New Interview
          </button>
        </div>

        {results.length === 0 ? (
          /* Empty Session State */
          <div className="card shadow-sm border-0 text-center p-5 bg-white rounded-4 mt-5">
            <div className="text-secondary mb-4">
              <AlertCircle size={64} className="text-muted" />
            </div>
            <h4 className="fw-bold text-slate-800 mb-2">No Reports Available</h4>
            <p className="text-secondary small mb-4">You haven't completed any mock interviews yet. Launch a session to receive your evaluation!</p>
            <div className="d-flex justify-content-center">
              <button 
                className="btn btn-primary rounded-3 px-4 py-2"
                onClick={() => navigate("/interview-generator")}
              >
                Generate First mock Interview
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics Dashboard */}
            <div className="row g-4 mb-4">
              <div className="col-12 col-md-6">
                <div className="card shadow-sm border-0 p-4 rounded-4 bg-white">
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-3 bg-primary-subtle text-primary rounded-3">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h6 className="text-secondary mb-1 uppercase fw-semibold" style={{ fontSize: "12px", letterSpacing: "0.5px" }}>Interviews Completed</h6>
                      <h3 className="fw-bold m-0 text-slate-800">{totalInterviews}</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="card shadow-sm border-0 p-4 rounded-4 bg-white">
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-3 bg-success-subtle text-success rounded-3">
                      <Award size={24} />
                    </div>
                    <div>
                      <h6 className="text-secondary mb-1 uppercase fw-semibold" style={{ fontSize: "12px", letterSpacing: "0.5px" }}>Average Grade Score</h6>
                      <h3 className="fw-bold m-0 text-success">{averageScore}%</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* List of Report Documents */}
            <div className="card shadow-sm border-0 rounded-4 bg-white overflow-hidden">
              <div className="card-header bg-white py-3 border-bottom-0">
                <h5 className="m-0 fw-bold text-slate-800 px-2" style={{ fontSize: "15px" }}>Previous Evaluations</h5>
              </div>
              <div className="list-group list-group-flush">
                {results.map((item, idx) => {
                  const evalDate = new Date(item.evaluated_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  });
                  return (
                    <div 
                      key={item.interview_id || idx} 
                      className="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-4 border-bottom"
                      style={{ cursor: "pointer", transition: "background 0.2s" }}
                      onClick={() => navigate(`/interview-result/${item.interview_id}`, { state: { evaluation: item } })}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          className="d-flex align-items-center justify-content-center fw-bold rounded-circle"
                          style={{
                            width: "55px",
                            height: "55px",
                            backgroundColor: item.overall_score >= 80 ? "#e6f4ea" : (item.overall_score >= 60 ? "#fef7e0" : "#fce8e6"),
                            color: item.overall_score >= 80 ? "#137333" : (item.overall_score >= 60 ? "#b06000" : "#c5221f")
                          }}
                        >
                          {item.overall_score}%
                        </div>
                        <div>
                          <div className="fw-bold text-slate-800" style={{ fontSize: "14px" }}>
                            Session ID: <span className="text-muted fw-normal small">{item.interview_id}</span>
                          </div>
                          <div className="d-flex align-items-center gap-2 mt-1 text-secondary small">
                            <Calendar size={14} />
                            <span>Evaluated on {evalDate}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center gap-3">
                        <div className="text-end d-none d-md-block">
                          <span className="badge bg-secondary-subtle text-secondary border px-2.5 py-1.5 rounded-pill small">
                            {item.question_feedback?.length || 0} Questions
                          </span>
                        </div>
                        <ChevronRight className="text-secondary" size={18} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default InterviewResults;
