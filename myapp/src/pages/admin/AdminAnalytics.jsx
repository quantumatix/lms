import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";
import { TrendingUp, Users, CheckCircle, Target, Award, Zap } from "lucide-react";
import { API_BASE } from "../../config";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#0ea5e9", "#ec4899", "#14b8a6"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-3 shadow p-3 border-0" style={{ fontSize: "13px", minWidth: "150px" }}>
        <p className="fw-bold mb-1 text-dark">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="mb-0" style={{ color: p.color }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function AdminAnalytics() {
  const [lessonCompletion, setLessonCompletion] = useState([]);
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [quizAccuracy, setQuizAccuracy] = useState([]);
  const [stats, setStats] = useState({ students: 0, lessons: 0, average_progress: 0 });
  const [codingStats, setCodingStats] = useState({
    total_attempts: 0,
    pass_rate: 0,
    failed_attempts: 0,
    avg_execution_time: 0,
    xp_earned: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { "Content-Type": "application/json" };

    Promise.all([
      fetch(API_BASE + "/admin/analytics/lesson-completion").then(r => r.json()),
      fetch(API_BASE + "/admin/analytics/student-performance").then(r => r.json()),
      fetch(API_BASE + "/admin/analytics/quiz-accuracy").then(r => r.json()),
      fetch(API_BASE + "/admin/stats").then(r => r.json()),
      fetch(API_BASE + "/admin/coding-practice/analytics").then(r => r.json()).catch(() => ({}))
    ])
      .then(([completion, performance, accuracy, statsData, codingData]) => {
        setLessonCompletion(Array.isArray(completion) ? completion : []);
        setStudentPerformance(Array.isArray(performance) ? performance : []);
        setQuizAccuracy(Array.isArray(accuracy) ? accuracy : []);
        setStats(statsData || {});
        setCodingStats(codingData || { total_attempts: 0, pass_rate: 0, failed_attempts: 0, avg_execution_time: 0, xp_earned: 0 });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const summaryCards = [
    {
      title: "Total Students",
      value: stats.students || 0,
      icon: <Users size={22} />,
      color: "#6366f1",
      bg: "#eef2ff"
    },
    {
      title: "Avg. Completion",
      value: `${stats.average_progress || 0}%`,
      icon: <CheckCircle size={22} />,
      color: "#10b981",
      bg: "#ecfdf5"
    },
    {
      title: "Lessons Published",
      value: stats.lessons || 0,
      icon: <Award size={22} />,
      color: "#f59e0b",
      bg: "#fffbeb"
    },
    {
      title: "MCQ Questions",
      value: stats.mcqs || 0,
      icon: <Zap size={22} />,
      color: "#8b5cf6",
      bg: "#f5f3ff"
    }
  ];

  const hasLessonData = lessonCompletion.length > 0;
  const hasQuizData = quizAccuracy.length > 0;
  const hasStudentData = studentPerformance.length > 0;

  const EmptyChart = ({ message }) => (
    <div className="d-flex flex-column align-items-center justify-content-center h-100 py-5 text-muted">
      <Target size={36} style={{ opacity: 0.2 }} className="mb-2" />
      <p className="small mb-0">{message}</p>
    </div>
  );

  return (
    <AdminLayout>
      <div className="mb-5">
        <h2 className="fw-bold text-dark mb-1">Advanced Analytics</h2>
        <p className="text-muted mb-0">Real-time insights into student performance and content engagement.</p>
      </div>

      {/* Summary Cards */}
      <div className="row g-4 mb-5">
        {summaryCards.map((card, i) => (
          <div key={i} className="col-md-6 col-xl-3">
            <div className="card border-0 shadow-sm p-4 rounded-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: 44, height: 44, background: card.bg, color: card.color }}
                >
                  {card.icon}
                </div>
                <TrendingUp size={16} className="text-muted" style={{ opacity: 0.4 }} />
              </div>
              <h3 className="fw-bold mb-1">
                {loading ? <div className="spinner-border spinner-border-sm text-muted" /> : card.value}
              </h3>
              <p className="text-muted small mb-0 fw-medium">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Coding Practice Analytics Row */}
      <h4 className="fw-bold text-dark mb-3 mt-1">Coding Practice Performance</h4>
      <div className="row g-3 mb-5">
        
        <div className="col-12 col-sm-6 col-md">
          <div className="card border-0 shadow-sm p-4 rounded-4 text-center h-100">
            <p className="text-muted small mb-2 fw-semibold">Coding Attempts</p>
            <h3 className="fw-bold mb-0 text-dark" style={{ color: "#4f46e5" }}>{codingStats.total_attempts}</h3>
            <span className="badge text-slate bg-light mt-2" style={{ fontSize: "10px", color: "#64748b" }}>Total runs & submissions</span>
          </div>
        </div>
        
        <div className="col-12 col-sm-6 col-md">
          <div className="card border-0 shadow-sm p-4 rounded-4 text-center h-100">
            <p className="text-muted small mb-2 fw-semibold">Average Pass Rate</p>
            <h3 className="fw-bold mb-0 text-success" style={{ color: "#10b981" }}>{codingStats.pass_rate}%</h3>
            <span className="badge bg-success bg-opacity-10 text-success mt-2" style={{ fontSize: "10px" }}>Correct answers</span>
          </div>
        </div>
        
        <div className="col-12 col-sm-6 col-md">
          <div className="card border-0 shadow-sm p-4 rounded-4 text-center h-100">
            <p className="text-muted small mb-2 fw-semibold">Failed Attempts</p>
            <h3 className="fw-bold mb-0 text-danger" style={{ color: "#ef4444" }}>{codingStats.failed_attempts}</h3>
            <span className="badge bg-danger bg-opacity-10 text-danger mt-2" style={{ fontSize: "10px" }}>Test assertions failed</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md">
          <div className="card border-0 shadow-sm p-4 rounded-4 text-center h-100">
            <p className="text-muted small mb-2 fw-semibold">Avg Execution Time</p>
            <h3 className="fw-bold mb-0 text-info" style={{ color: "#0ea5e9" }}>{codingStats.avg_execution_time}s</h3>
            <span className="badge bg-info bg-opacity-10 text-info mt-2" style={{ fontSize: "10px" }}>Subprocess runtime</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md">
          <div className="card border-0 shadow-sm p-4 rounded-4 text-center h-100">
            <p className="text-muted small mb-2 fw-semibold">XP Earned</p>
            <h3 className="fw-bold mb-0 text-warning" style={{ color: "#f59e0b" }}>{codingStats.xp_earned} XP</h3>
            <span className="badge bg-warning bg-opacity-10 text-warning mt-2" style={{ fontSize: "10px" }}>Cumulative rewarded</span>
          </div>
        </div>

      </div>

      {/* Lesson Completion + Quiz Accuracy Row */}
      <div className="row g-4 mb-4">
        {/* Lesson Completion Bar Chart */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4 rounded-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold mb-0">Lesson Completion Count</h5>
                <p className="text-muted small mb-0">How many students completed each lesson</p>
              </div>
              <span className="badge rounded-pill px-3 py-2 fw-bold"
                style={{ background: "#eef2ff", color: "#6366f1", fontSize: "11px" }}>
                Top {lessonCompletion.length} Lessons
              </span>
            </div>
            <div style={{ height: 280 }}>
              {loading ? (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <div className="spinner-border text-primary" />
                </div>
              ) : !hasLessonData ? (
                <EmptyChart message="No completion data yet. Students need to complete lessons first." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lessonCompletion} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="completed" name="Students completed" fill="#6366f1" radius={[6, 6, 0, 0]}>
                      {lessonCompletion.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Completion Pie */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 rounded-4 h-100">
            <h5 className="fw-bold mb-1">Completion Distribution</h5>
            <p className="text-muted small mb-4">Relative completion across lessons</p>
            <div style={{ height: 200 }}>
              {!hasLessonData ? (
                <EmptyChart message="No data yet." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={lessonCompletion.slice(0, 6)}
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="completed"
                    >
                      {lessonCompletion.slice(0, 6).map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-3 d-flex flex-column gap-1">
              {lessonCompletion.slice(0, 4).map((item, i) => (
                <div key={i} className="d-flex justify-content-between align-items-center small">
                  <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle" style={{ width: 8, height: 8, background: COLORS[i % COLORS.length] }} />
                    <span className="text-muted">{item.name}</span>
                  </div>
                  <span className="fw-bold">{item.completed}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Accuracy + Student Performance Row */}
      <div className="row g-4">
        {/* Quiz Accuracy Bar Chart */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4 rounded-4 h-100">
            <div className="mb-4">
              <h5 className="fw-bold mb-0">Quiz Accuracy by Lesson</h5>
              <p className="text-muted small mb-0">Average % score on MCQ quizzes</p>
            </div>
            <div style={{ height: 250 }}>
              {loading ? (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <div className="spinner-border text-primary" />
                </div>
              ) : !hasQuizData ? (
                <EmptyChart message="No quiz attempts recorded yet." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quizAccuracy} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                      height={48}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} domain={[0, 100]} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="accuracy" name="Accuracy %" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Student Performance Area Chart */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4 rounded-4 h-100">
            <div className="mb-4">
              <h5 className="fw-bold mb-0">Top Student XP</h5>
              <p className="text-muted small mb-0">XP earned by your highest-performing students</p>
            </div>
            <div style={{ height: 250 }}>
              {loading ? (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <div className="spinner-border text-primary" />
                </div>
              ) : !hasStudentData ? (
                <EmptyChart message="No student XP data available yet." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={studentPerformance.slice(0, 8)}
                    margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                      height={48}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="xp"
                      name="XP Earned"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      fill="url(#xpGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminAnalytics;
