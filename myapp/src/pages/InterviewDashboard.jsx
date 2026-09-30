import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useCourse } from "../context/CourseContext";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { 
  Trophy, 
  Flame, 
  Cpu, 
  Award,
  BookOpen, 
  Layers, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Brain,
  AlertCircle
} from "lucide-react";

function InterviewDashboard() {
  const navigate = useNavigate();
  const { selectedCourse } = useCourse();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!username) {
      navigate("/");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    const courseParam = selectedCourse?.id ? `?course_id=${selectedCourse.id}` : "";
    fetch(`http://127.0.0.1:8000/interview/skill-analysis/${username}${courseParam}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Student data analysis failed or student not found.");
        }
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [username, selectedCourse?.id, navigate]);

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

  if (error || !data) {
    return (
      <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <Sidebar />
        <div className="flex-grow-1 p-5 d-flex align-items-center justify-content-center" style={{ marginLeft: "260px" }}>
          <div className="card shadow-sm border-0 text-center p-5 bg-white rounded-4" style={{ maxWidth: "500px" }}>
            <div className="text-danger mb-4">
              <AlertCircle size={64} />
            </div>
            <h3 className="fw-bold text-dark mb-2">Analysis Failed</h3>
            <p className="text-muted mb-4">{error || "Could not retrieve student performance profiles."}</p>
            <button onClick={() => navigate("/dashboard")} className="btn btn-primary px-4 py-2 rounded-pill fw-bold border-0" style={{ backgroundColor: "#4f46e5" }}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format skills data for Recharts (Topic Score list)
  const skillsData = data.skills || [];

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-grow-1 p-4 p-md-5" style={{ marginLeft: "260px" }}>
        
        {/* Header Summary */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-5 gap-3">
          <div>
            <h1 className="h2 fw-bold text-dark mb-1" style={{ letterSpacing: "-0.5px" }}>
              Interview Readiness Profile 🎓
            </h1>
            <p className="text-muted mb-0 small">
              Analyzing {data.technology || selectedCourse?.technology || "technology"} capability metrics for <strong>{data.username}</strong> ({data.email || "student"})
            </p>
          </div>
          <button 
            onClick={() => navigate("/mock-interview")}
            className="btn btn-primary px-4 py-2.5 rounded-pill fw-bold border-0 d-flex align-items-center gap-2 shadow-sm"
            style={{ backgroundColor: "#4f46e5" }}
          >
            <Brain size={18} /> Start Mock Interview
          </button>
        </div>

        {/* Overall Stats Cards */}
        <div className="row g-4 mb-5">
          {/* Card 1: Overall Progress */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card shadow-sm border-0 h-100 p-4 bg-white rounded-4 transition-all">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted fw-semibold small">Overall Progress</span>
                <div className="rounded-3 p-2 bg-primary-subtle text-primary">
                  <TrendingUp size={20} />
                </div>
              </div>
              <h2 className="fw-bold mb-2 text-dark">{data.overall_progress}%</h2>
              <div className="progress rounded-pill style-progress" style={{ height: "6px" }}>
                <div 
                  className="progress-bar rounded-pill" 
                  style={{ width: `${data.overall_progress}%`, backgroundColor: "#4f46e5" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Card 2: XP */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card shadow-sm border-0 h-100 p-4 bg-white rounded-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted fw-semibold small">Total XP Earned</span>
                <div className="rounded-3 p-2 bg-warning-subtle text-warning">
                  <Flame size={20} />
                </div>
              </div>
              <h2 className="fw-bold mb-2 text-dark">{data.xp} XP</h2>
              <span className="text-muted small">
                {data.completed_lessons} completed • {data.remaining_lessons} remaining
              </span>
            </div>
          </div>

          {/* Card 3: MCQ Accuracy */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card shadow-sm border-0 h-100 p-4 bg-white rounded-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted fw-semibold small">MCQ Accuracy</span>
                <div className="rounded-3 p-2 bg-success-subtle text-success">
                  <Award size={20} />
                </div>
              </div>
              <h2 className="fw-bold mb-2 text-dark">{data.mcq_accuracy}%</h2>
              <span className="text-muted small">
                Based on quiz questions attempted
              </span>
            </div>
          </div>

          {/* Card 4: Coding Success */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card shadow-sm border-0 h-100 p-4 bg-white rounded-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted fw-semibold small">Coding Success Rate</span>
                <div className="rounded-3 p-2 bg-info-subtle text-info">
                  <Cpu size={20} />
                </div>
              </div>
              <h2 className="fw-bold mb-2 text-dark">{data.coding_success_rate}%</h2>
              <span className="text-muted small">
                {data.practice_average}% Practice Exercises completed
              </span>
            </div>
          </div>
        </div>

        {/* Charts & Topics Detail Row */}
        <div className="row g-4 mb-4">
          
          {/* Recharts Skill Bar Chart */}
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm border-0 p-4 bg-white rounded-4 h-100">
              <h4 className="fw-bold text-dark mb-4">Topic Proficiencies</h4>
              <div style={{ width: "100%", height: "450px" }}>
                <ResponsiveContainer>
                  <BarChart
                    data={skillsData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                    <YAxis dataKey="topic" type="category" stroke="#94a3b8" fontSize={12} width={120} />
                    <Tooltip 
                      formatter={(value) => [`${value}% Accuracy`, 'Proficiency']} 
                      contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    />
                    <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={16}>
                      {skillsData.map((entry, index) => {
                        // High score -> purple, Low score -> red/orange
                        let barColor = "#818cf8"; // defaults
                        if (entry.score >= 80) barColor = "#10b981"; // success green
                        else if (entry.score <= 60) barColor = "#f43f5e"; // alert pink/red
                        return <Cell key={`cell-${index}`} fill={barColor} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Strong vs Weak Topics Lists */}
          <div className="col-12 col-lg-4">
            <div className="d-flex flex-column gap-4 h-100">
              
              {/* Strong Topics Card */}
              <div className="card shadow-sm border-0 p-4 bg-white rounded-4 flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <CheckCircle2 className="text-success" size={24} />
                  <h4 className="fw-bold text-dark mb-0">Strong Areas (≥80%)</h4>
                </div>
                {data.strong_topics?.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2">
                    {data.strong_topics.map((topic, i) => (
                      <span key={i} className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-semibold" style={{ fontSize: "12px" }}>
                        {topic}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted small mb-0">No topics are currently ranked above 80% accuracy. Complete lessons and coding challenges to strengthen skills!</p>
                )}
              </div>

              {/* Weak Topics Card */}
              <div className="card shadow-sm border-0 p-4 bg-white rounded-4 flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <XCircle className="text-danger" size={24} />
                  <h4 className="fw-bold text-dark mb-0">Focus Areas (≤60%)</h4>
                </div>
                {data.weak_topics?.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2">
                    {data.weak_topics.map((topic, i) => (
                      <span key={i} className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill fw-semibold" style={{ fontSize: "12px" }}>
                        {topic}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-success small mb-0">Congratulations! No topics are categorized as weak (under 60%). You are doing great!</p>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default InterviewDashboard;
