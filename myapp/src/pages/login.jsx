import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Code2, 
  Sparkles, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Terminal,
  Zap,
  BookOpen
} from "lucide-react";
import { API_BASE } from "../config";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const loginUser = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setMessage({ text: "Please enter both email and password.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch(API_BASE + "/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (data.message === "Login Successful") {
        const userRole = data.role || "student";
        localStorage.setItem("username", data.email || email.trim().toLowerCase());
        localStorage.setItem("userRole", userRole);
        if (data.name) localStorage.setItem("userName", data.name);

        setMessage({ 
          text: `Welcome back! Redirecting to ${userRole === "admin" ? "Admin Panel" : "Student Dashboard"}...`, 
          type: "success" 
        });

        setTimeout(() => {
          if (userRole === "admin") {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        }, 800);
      } else {
        setMessage({ 
          text: data.message || "Invalid email or password. Please try again.", 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Login Error:", error);
      setMessage({ 
        text: "Cannot connect to backend server on port 8000. Please ensure the FastAPI server is running.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center p-3 p-md-4"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Decorative ambient background glows */}
      <div 
        style={{
          position: "absolute",
          top: "-15%",
          left: "-10%",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0) 70%)",
          borderRadius: "50%",
          pointerEvents: "none"
        }}
      />
      <div 
        style={{
          position: "absolute",
          bottom: "-15%",
          right: "-10%",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, rgba(14, 165, 233, 0) 70%)",
          borderRadius: "50%",
          pointerEvents: "none"
        }}
      />

      <div className="container" style={{ maxWidth: "1100px", position: "relative", zIndex: 1 }}>
        <div 
          className="row g-0 rounded-4 overflow-hidden shadow-lg border border-secondary border-opacity-25"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(16px)"
          }}
        >
          {/* Left Hero / Brand Column (visible on lg+) */}
          <div 
            className="col-lg-6 d-none d-lg-flex flex-column justify-content-between p-5 text-white"
            style={{
              background: "linear-gradient(145deg, rgba(79, 70, 229, 0.2) 0%, rgba(30, 27, 75, 0.4) 100%)",
              borderRight: "1px solid rgba(255, 255, 255, 0.08)"
            }}
          >
            <div>
              {/* Brand Header */}
              <div className="d-flex align-items-center gap-3 mb-4">
                <div 
                  className="rounded-3 d-flex align-items-center justify-content-center shadow"
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)"
                  }}
                >
                  <Code2 size={26} className="text-white" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0 text-white tracking-tight" style={{ fontSize: "22px" }}>
                    PyLearn <span style={{ color: "#38bdf8" }}>LMS</span>
                  </h3>
                  <small className="text-white-50" style={{ fontSize: "12px" }}>
                    AI-Powered Python Learning
                  </small>
                </div>
              </div>

              {/* Tagline */}
              <h2 className="fw-bold text-white mb-3" style={{ fontSize: "28px", lineHeight: "1.3" }}>
                Master Python with <span style={{ color: "#818cf8" }}>Adaptive AI</span> & Interactive Practice
              </h2>
              <p className="text-light text-opacity-75 mb-4" style={{ fontSize: "14px" }}>
                From basic syntax to advanced algorithms, PyLearn blends AI-generated lessons, real-time code sandboxes, and AI technical mock interviews.
              </p>

              {/* Feature Highlights */}
              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex align-items-center gap-3 p-2 rounded-3" style={{ background: "rgba(255, 255, 255, 0.04)" }}>
                  <div className="p-2 rounded-2" style={{ background: "rgba(99, 102, 241, 0.2)" }}>
                    <Terminal size={18} className="text-info" />
                  </div>
                  <div>
                    <div className="fw-semibold text-white" style={{ fontSize: "13px" }}>In-Browser Code Execution</div>
                    <div className="text-white-50" style={{ fontSize: "11px" }}>Run test-cased challenges safely with instant feedback</div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3 p-2 rounded-3" style={{ background: "rgba(255, 255, 255, 0.04)" }}>
                  <div className="p-2 rounded-2" style={{ background: "rgba(16, 185, 129, 0.2)" }}>
                    <Sparkles size={18} className="text-success" />
                  </div>
                  <div>
                    <div className="fw-semibold text-white" style={{ fontSize: "13px" }}>AI Curriculum & Generation</div>
                    <div className="text-white-50" style={{ fontSize: "11px" }}>Deep theory, MCQs & interview questions on any topic</div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3 p-2 rounded-3" style={{ background: "rgba(255, 255, 255, 0.04)" }}>
                  <div className="p-2 rounded-2" style={{ background: "rgba(245, 158, 11, 0.2)" }}>
                    <Zap size={18} className="text-warning" />
                  </div>
                  <div>
                    <div className="fw-semibold text-white" style={{ fontSize: "13px" }}>Gamified XP & Leveling</div>
                    <div className="text-white-50" style={{ fontSize: "11px" }}>Earn rewards, track streaks, and climb the leaderboard</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Quote / Code Preview */}
            <div 
              className="p-3 rounded-3"
              style={{
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                fontSize: "12px",
                fontFamily: "monospace"
              }}
            >
              <div className="d-flex align-items-center gap-1 mb-2 text-white-50">
                <span className="rounded-circle" style={{ width: "8px", height: "8px", background: "#ef4444" }} />
                <span className="rounded-circle" style={{ width: "8px", height: "8px", background: "#f59e0b" }} />
                <span className="rounded-circle" style={{ width: "8px", height: "8px", background: "#10b981" }} />
                <span className="ms-2">pylearn_engine.py</span>
              </div>
              <div className="text-info">def <span className="text-warning">learn_python</span>(student):</div>
              <div className="ps-3 text-light">while <span className="text-info">student.curious</span>:</div>
              <div className="ps-4 text-light">student.gain_xp(level_up=<span className="text-success">True</span>)</div>
            </div>
          </div>

          {/* Right Login Form Column */}
          <div className="col-lg-6 p-4 p-md-5 d-flex flex-column justify-content-center">
            {/* Mobile Brand Header */}
            <div className="d-flex d-lg-none align-items-center gap-2 mb-4">
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: "38px", height: "38px", background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)" }}
              >
                <Code2 size={20} className="text-white" />
              </div>
              <h4 className="fw-bold mb-0 text-white">PyLearn LMS</h4>
            </div>

            <div className="mb-4">
              <h2 className="fw-bold text-white mb-1" style={{ fontSize: "24px" }}>
                Welcome Back 👋
              </h2>
              <p className="text-white-50 mb-0" style={{ fontSize: "14px" }}>
                Sign in to continue your Python journey or access admin tools.
              </p>
            </div>

            {/* Notification / Alert */}
            {message.text && (
              <div 
                className={`alert d-flex align-items-center gap-2 py-2 px-3 mb-4 rounded-3 border ${
                  message.type === "success" 
                    ? "bg-success bg-opacity-10 text-success border-success border-opacity-25" 
                    : message.type === "info"
                    ? "bg-info bg-opacity-10 text-info border-info border-opacity-25"
                    : "bg-danger bg-opacity-10 text-danger border-danger border-opacity-25"
                }`}
                style={{ fontSize: "13px" }}
              >
                {message.type === "success" && <CheckCircle2 size={18} className="flex-shrink-0" />}
                {message.type === "error" && <AlertCircle size={18} className="flex-shrink-0" />}
                {message.type === "info" && <Sparkles size={18} className="flex-shrink-0" />}
                <div>{message.text}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={loginUser}>
              {/* Email Input */}
              <div className="mb-3">
                <label className="form-label text-white-50 fw-semibold mb-1" style={{ fontSize: "13px" }}>
                  Email Address
                </label>
                <div className="position-relative">
                  <span 
                    className="position-absolute top-50 translate-middle-y text-white-50 ps-3"
                    style={{ pointerEvents: "none" }}
                  >
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    className="form-control text-white ps-5 pe-3 py-2 border rounded-3"
                    placeholder="e.g. learner@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      background: "rgba(30, 41, 59, 0.8)",
                      borderColor: "rgba(255, 255, 255, 0.15)",
                      fontSize: "14px"
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label text-white-50 fw-semibold mb-0" style={{ fontSize: "13px" }}>
                    Password
                  </label>
                </div>
                <div className="position-relative">
                  <span 
                    className="position-absolute top-50 translate-middle-y text-white-50 ps-3"
                    style={{ pointerEvents: "none" }}
                  >
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="form-control text-white ps-5 pe-5 py-2 border rounded-3"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      background: "rgba(30, 41, 59, 0.8)",
                      borderColor: "rgba(255, 255, 255, 0.15)",
                      fontSize: "14px"
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-white-50 pe-3 text-decoration-none border-0"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn w-100 text-white fw-bold py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 shadow border-0"
                style={{
                  background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                  fontSize: "14px",
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="spinner-border spinner-border-sm" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to PyLearn
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Sign Up Divider & Link */}
            <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 text-center">
              <p className="text-white-50 mb-0" style={{ fontSize: "14px" }}>
                New to PyLearn?{" "}
                <Link 
                  to="/signup" 
                  className="fw-bold text-decoration-none"
                  style={{ color: "#38bdf8" }}
                >
                  Create an account / Sign Up &rarr;
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;