import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { 
  Flame, 
  Trophy, 
  BookOpen, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  BrainCircuit, 
  ArrowRight,
  CheckCircle,
  Clock,
  ChevronRight,
  Search,
  Target,
  Zap,
  BarChart3
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [codingAnalytics, setCodingAnalytics] = useState(null);
  const [adaptiveRecommendations, setAdaptiveRecommendations] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [weakTopics, setWeakTopics] = useState(null);
  const [recommendedLessons, setRecommendedLessons] = useState([]);


  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) {
      navigate("/");
      return;
    }

    // Existing API Fetches
    fetch(`http://127.0.0.1:8000/progress/${username}`)
      .then((res) => res.json())
      .then((data) => setProgress(data))
      .catch((err) => console.log(err));

    fetch(`http://127.0.0.1:8000/analytics/${username}`)
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch((err) => console.log(err));

    fetch("http://127.0.0.1:8000/coding-analytics")
      .then((res) => res.json())
      .then((data) => setCodingAnalytics(data))
      .catch((err) => console.log(err));

    fetch(`http://127.0.0.1:8000/score-history/${username}`)
      .then((res) => res.json())
      .then((data) => setChartData(data))
      .catch((err) => console.log(err));

    fetch(`http://127.0.0.1:8000/adaptive-recommendations/${username}`)
      .then((res) => res.json())
      .then((data) => setAdaptiveRecommendations(data))
      .catch((err) => console.log(err));

    fetch(`http://127.0.0.1:8000/daily-review/${username}`)
      .then((res) => res.json())
      .then((data) => setMistakes(data))
      .catch((err) => console.log(err));

    fetch(`http://127.0.0.1:8000/weak-topics/${username}`)
      .then((res) => res.json())
      .then((data) => setWeakTopics(data))
      .catch((err) => console.log(err));

    fetch(`http://127.0.0.1:8000/lessons/recommendations/${username}`)
      .then((res) => res.json())
      .then((data) => setRecommendedLessons(data))
      .catch((err) => console.log(err));

  }, [navigate]);

  const username = localStorage.getItem("username") || "Learner";

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-grow-1" style={{ marginLeft: "260px" }}>
        
        <div className="dashboard-container">
          
          {/* Header Row */}
          <div className="row mb-5 align-items-center">
            <div className="col-md-7">
              <h1 className="display-6 fw-bold mb-1" style={{ letterSpacing: "-1px" }}>
                Welcome Back, {username} 👋
              </h1>
              <p className="text-muted fs-6 mb-4">
                You've completed <span className="text-dark fw-bold">{progress?.progress || 0}%</span> of your Python path. Keep it up!
              </p>
              <button 
                onClick={() => navigate("/lessons")}
                className="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-sm d-flex align-items-center gap-2"
                style={{ backgroundColor: "#4f46e5", width: "fit-content" }}
              >
                <BookOpen size={18} /> Start Learning
              </button>
            </div>
            <div className="col-md-5 d-flex justify-content-md-end gap-3 flex-wrap">
              <div className="stat-pill d-flex align-items-center gap-2 px-3 py-2 bg-white rounded-pill shadow-sm border">
                <Flame size={18} className="text-warning fill-warning" />
                <span className="fw-bold" style={{ fontSize: "14px" }}>{progress?.streak || 0} Streak</span>
              </div>
              <div className="stat-pill d-flex align-items-center gap-2 px-3 py-2 bg-white rounded-pill shadow-sm border">
                <Zap size={18} className="text-primary fill-primary" />
                <span className="fw-bold" style={{ fontSize: "14px" }}>{progress?.xp || progress?.score || 0} XP</span>
              </div>
              <div className="stat-pill d-flex align-items-center gap-2 px-3 py-2 bg-white rounded-pill shadow-sm border">
                <Target size={18} className="text-success" />
                <span className="fw-bold" style={{ fontSize: "14px" }}>{progress?.completed_topics?.length || 0} Topics</span>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Main Stats Column */}
            <div className="col-lg-8">
              <div className="d-flex flex-column gap-4">

                {/* Progress Overview Card */}
                <div className="card shadow-sm p-4 hover-lift">
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <h5 className="fw-bold mb-1">Learning Progress</h5>
                      <p className="text-muted small mb-0">Current Course: Python Foundation</p>
                    </div>
                    <span className="badge rounded-pill bg-primary-light text-primary border border-primary-subtle px-3 py-2">
                       {progress?.level || "Beginner"} Level
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="fw-semibold small">Overall Completion</span>
                      <span className="fw-bold text-primary">{progress?.progress || 0}%</span>
                    </div>
                    <div className="progress overflow-visible" style={{ height: "10px" }}>
                      <div 
                        className="progress-bar bg-primary rounded-pill position-relative" 
                        style={{ width: `${progress?.progress || 0}%`, transition: "width 1s ease-in-out" }}
                      >
                        <div className="position-absolute end-0 top-50 translate-middle-y bg-white border border-primary rounded-circle" style={{ width: "18px", height: "18px", marginRight: "-9px" }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-6 col-sm-3">
                      <div className="p-3 bg-light rounded-3 text-center">
                        <div className="text-muted small mb-1">Accuracy</div>
                        <div className="h5 fw-bold mb-0 text-dark">{codingAnalytics?.accuracy || 0}%</div>
                      </div>
                    </div>
                    <div className="col-6 col-sm-3">
                      <div className="p-3 bg-light rounded-3 text-center">
                        <div className="text-muted small mb-1">XP Points</div>
                        <div className="h5 fw-bold mb-0 text-dark">{progress?.xp || progress?.score || 0}</div>
                      </div>
                    </div>
                    <div className="col-6 col-sm-3">
                      <div className="p-3 bg-light rounded-3 text-center">
                        <div className="text-muted small mb-1">Lessons</div>
                        <div className="h5 fw-bold mb-0 text-dark">{progress?.completed_topics?.length || 0}</div>
                      </div>
                    </div>
                    <div className="col-6 col-sm-3">
                      <div className="p-3 bg-light rounded-3 text-center border border-warning-subtle" style={{ backgroundColor: "#fffbeb" }}>
                        <div className="text-warning small mb-1 fw-bold">Goals</div>
                        <div className="h5 fw-bold mb-0 text-warning">8/10</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Growth Analytics Row */}
                <div className="row g-4">
                  <div className="col-md-6 col-xl-3">
                    <div className="card shadow-sm p-3 hover-lift h-100">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-success-light text-success p-2 rounded-3">
                          <Activity size={20} />
                        </div>
                        <div>
                          <p className="text-muted small mb-0">Accuracy</p>
                          <h4 className="fw-bold mb-0">{codingAnalytics?.accuracy || 0}%</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-xl-3">
                    <Link to="/coding-practice" className="text-decoration-none">
                      <div className="card shadow-sm p-3 hover-lift h-100">
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-primary-light text-primary p-2 rounded-3">
                            <Target size={20} />
                          </div>
                          <div>
                            <p className="text-muted small mb-0">Challenges</p>
                            <h4 className="fw-bold mb-0 text-dark">{codingAnalytics?.total_attempts || 0}</h4>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="col-md-6 col-xl-3">
                    <div className="card shadow-sm p-3 hover-lift h-100">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-warning-light text-warning p-2 rounded-3">
                          <Trophy size={20} />
                        </div>
                        <div>
                          <p className="text-muted small mb-0">XP Earned</p>
                          <h4 className="fw-bold mb-0">{progress?.xp || progress?.score || 0}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-xl-3">
                    <div className="card shadow-sm p-3 hover-lift h-100">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-danger-light text-danger p-2 rounded-3">
                          <AlertTriangle size={20} />
                        </div>
                        <div>
                          <p className="text-muted small mb-0">Focus Areas</p>
                          <h4 className="fw-bold mb-0">{weakTopics?.weak_topics?.length || 0}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart Card */}
                <div className="card shadow-sm p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Performance Analytics</h5>
                    <button className="btn btn-light btn-sm border text-muted px-3">Weekly</button>
                  </div>
                  <div style={{ width: "100%", height: 320 }}>
                    <ResponsiveContainer>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="test" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#94a3b8', fontSize: 12}}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#94a3b8', fontSize: 12}}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'rgba(0,0,0,0.1) 0 10px 25px' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#4f46e5" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorScore)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Mistake Analysis Section */}
                <div className="card shadow-sm p-4">
                  <div className="d-flex align-items-center gap-2 mb-4">
                    <AlertTriangle size={22} className="text-warning" />
                    <h5 className="fw-bold mb-0">Recent Mistakes</h5>
                  </div>

                  {mistakes.length === 0 ? (
                    <div className="text-center py-4 bg-light rounded-4">
                      <p className="text-muted mb-0">No mistakes recorded yet. You're doing great!</p>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {mistakes.slice(0, 3).map((mistake, index) => (
                        <div key={index} className="col-12">
                          <div className="p-3 border rounded-3 bg-light-subtle d-flex justify-content-between align-items-center">
                            <div>
                              <div className="fw-bold text-dark mb-1" style={{ fontSize: "14px" }}>{mistake.question}</div>
                              <div className="text-muted small">Your Answer: <span className="text-danger">{mistake.user_answer}</span></div>
                            </div>
                            <span className="badge bg-danger-subtle text-danger">Incorrect</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Cards Column */}
            <div className="col-lg-4">
              <div className="d-flex flex-column gap-4">

                {/* Weekly Activity */}
                <div className="card shadow-sm p-4 bg-dark text-white hover-lift">
                  <h6 className="text-uppercase text-secondary fw-bold small mb-3">Weekly Activity</h6>
                  <div className="d-flex align-items-end justify-content-between">
                    <div>
                      <h2 className="display-5 fw-bold mb-1">{analytics?.total_tests || 0}</h2>
                      <p className="text-secondary small mb-0">Activities this week</p>
                    </div>
                    <div className="bg-success text-white px-2 py-1 rounded small fw-bold mb-2">
                      <TrendingUp size={14} className="me-1" /> +12%
                    </div>
                  </div>
                </div>

                {/* Focus Mode */}
                <div className="card shadow-sm p-4 hover-lift">
                  <h6 className="text-uppercase text-muted fw-bold small mb-3">Focus Mode</h6>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h5 className="fw-bold mb-1">Ready to Review?</h5>
                      <p className="text-muted small mb-0">Focus on weak topics</p>
                    </div>
                    <button 
                      onClick={() => navigate("/retry-review")}
                      className="btn btn-danger px-4 rounded-pill"
                    >
                      Start
                    </button>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="card shadow-sm p-4 border-start border-4 border-primary">
                  <div className="d-flex align-items-center gap-2 mb-4">
                    <BrainCircuit size={22} className="text-primary" />
                    <h5 className="fw-bold mb-0">AI Recommendations</h5>
                  </div>
                  
                  {recommendedLessons.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      <p className="text-muted small mb-2">Based on your focus areas:</p>
                      {recommendedLessons.slice(0, 3).map((lesson, index) => (
                        <Link 
                          key={index} 
                          to={`/lessons/${lesson.id}`}
                          className="d-flex gap-3 align-items-middle p-2 rounded-3 hover-bg-light text-decoration-none text-dark border-bottom"
                        >
                          <div className="bg-primary-light text-primary p-2 rounded-circle flex-shrink-0">
                            <Sparkles size={14} />
                          </div>
                          <div>
                            <div className="small fw-bold">{lesson.title}</div>
                            <div className="text-muted" style={{ fontSize: "10px" }}>{lesson.category_title}</div>
                          </div>
                          <ChevronRight size={14} className="ms-auto text-muted" />
                        </Link>
                      ))}
                    </div>
                  ) : adaptiveRecommendations?.recommendations && adaptiveRecommendations.recommendations.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      {adaptiveRecommendations.recommendations.slice(0, 3).map((rec, index) => (
                        <div key={index} className="d-flex gap-3 align-items-start">
                          <div className="bg-primary-light text-primary p-2 rounded-circle flex-shrink-0">
                            <Sparkles size={14} />
                          </div>
                          <p className="small mb-0 fw-medium">{rec}</p>
                        </div>
                      ))}
                      <Link to="/lessons" className="btn btn-primary w-100 mt-2 py-2 d-flex align-items-center justify-content-center gap-1">
                        Go to Lessons <ArrowRight size={16} />
                      </Link>
                    </div>
                  ) : (
                    <p className="text-muted small mb-0">Generating personalized path through your activity...</p>
                  )}

                </div>

                {/* Daily Streak Info Card */}
                <div className="card shadow-sm overflow-hidden" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}>
                  <div className="p-4 text-white position-relative">
                    <div className="position-absolute end-0 top-0 opacity-10" style={{ transform: "translate(20%, -20%)" }}>
                      <Flame size={120} />
                    </div>
                    <h6 className="text-white-50 fw-bold small mb-3">CONSISTENCY</h6>
                    <h4 className="fw-bold mb-4">You're on a {progress?.streak || 0} day roll!</h4>
                    <button className="btn btn-white text-primary px-4 border-0">Claim Reward</button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;