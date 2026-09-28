import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Code2, 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Terminal, 
  Check, 
  Flame 
} from "lucide-react";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const signupUser = async (e) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      setMessage({ text: "Please enter your full name.", type: "error" });
      return;
    }
    if (!email.trim()) {
      setMessage({ text: "Please enter a valid email address.", type: "error" });
      return;
    }
    if (!password) {
      setMessage({ text: "Please create a password.", type: "error" });
      return;
    }
    if (password.length < 6) {
      setMessage({ text: "Password must be at least 6 characters long.", type: "error" });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match. Please verify.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password,
          role: "student",
        }),
      });

      const data = await response.json();

      if (response.ok && (data.message === "User Registered Successfully" || data.email)) {
        // Automatically save session to localStorage
        const userEmail = data.email || email.trim().toLowerCase();
        
        localStorage.setItem("username", userEmail);
        localStorage.setItem("userRole", "student");
        localStorage.setItem("userName", name.trim());

        setMessage({ 
          text: "Student account created successfully! Redirecting to Dashboard...", 
          type: "success" 
        });

        // Direct student to their dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        setMessage({ 
          text: data.detail || data.message || "Failed to register account. This email might already exist.", 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Signup Error:", error);
      setMessage({ 
        text: "Cannot connect to backend server on port 8000. Please ensure the FastAPI backend is running.", 
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
          right: "-10%",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, rgba(14, 165, 233, 0) 70%)",
          borderRadius: "50%",
          pointerEvents: "none"
        }}
      />
      <div 
        style={{
          position: "absolute",
          bottom: "-15%",
          left: "-10%",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0) 70%)",
          borderRadius: "50%",
          pointerEvents: "none"
        }}
      />

      <div className="container" style={{ maxWidth: "1150px", position: "relative", zIndex: 1 }}>
        <div 
          className="row g-0 rounded-4 overflow-hidden shadow-lg border border-secondary border-opacity-25"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(16px)"
          }}
        >
          {/* Left Hero Column */}
          <div 
            className="col-lg-5 d-none d-lg-flex flex-column justify-content-between p-5 text-white"
            style={{
              background: "linear-gradient(145deg, rgba(79, 70, 229, 0.25) 0%, rgba(30, 27, 75, 0.5) 100%)",
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
              <h2 className="fw-bold text-white mb-3" style={{ fontSize: "26px", lineHeight: "1.3" }}>
                Start Your Journey from <span style={{ color: "#38bdf8" }}>Zero to Python Pro</span>
              </h2>
              <p className="text-light text-opacity-75 mb-4" style={{ fontSize: "14px" }}>
                Join PyLearn to practice code in real-time, solve AI-crafted challenges, and unlock career-ready technical skills.
              </p>

              {/* Steps/Value Points */}
              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex align-items-start gap-3">
                  <div className="p-1 rounded-circle bg-success bg-opacity-25 text-success mt-1">
                    <Check size={16} />
                  </div>
                  <div>
                    <div className="fw-semibold text-white" style={{ fontSize: "13px" }}>Structured 30-Day Masterclass</div>
                    <div className="text-white-50" style={{ fontSize: "12px" }}>Carefully crafted syllabus covering fundamentals to APIs and OOP.</div>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="p-1 rounded-circle bg-info bg-opacity-25 text-info mt-1">
                    <Check size={16} />
                  </div>
                  <div>
                    <div className="fw-semibold text-white" style={{ fontSize: "13px" }}>Interactive Code Compiler</div>
                    <div className="text-white-50" style={{ fontSize: "12px" }}>Write code and run against automated hidden test cases.</div>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="p-1 rounded-circle bg-warning bg-opacity-25 text-warning mt-1">
                    <Check size={16} />
                  </div>
                  <div>
                    <div className="fw-semibold text-white" style={{ fontSize: "13px" }}>AI Technical Interviews</div>
                    <div className="text-white-50" style={{ fontSize: "12px" }}>Mock technical questions evaluated dynamically with instant scoring.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Testimonial / Community Card */}
            <div 
              className="p-3 rounded-3"
              style={{
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.08)"
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-1">
                <Flame size={16} className="text-warning" />
                <span className="fw-bold text-white" style={{ fontSize: "12px" }}>100% Adaptive Learning</span>
              </div>
              <p className="text-white-50 mb-0" style={{ fontSize: "12px" }}>
                Whether you want to learn Python for Data Science, Web Development, or AI, PyLearn adapts to your speed.
              </p>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="col-lg-7 p-4 p-md-5 d-flex flex-column justify-content-center">
            {/* Mobile Header */}
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
                Create Student Account 🚀
              </h2>
              <p className="text-white-50 mb-0" style={{ fontSize: "14px" }}>
                Sign up to begin learning Python, solve coding challenges, and track your progress.
              </p>
            </div>

            {/* Notification / Alert */}
            {message.text && (
              <div 
                className={`alert d-flex align-items-center gap-2 py-2 px-3 mb-4 rounded-3 border ${
                  message.type === "success" 
                    ? "bg-success bg-opacity-10 text-success border-success border-opacity-25" 
                    : "bg-danger bg-opacity-10 text-danger border-danger border-opacity-25"
                }`}
                style={{ fontSize: "13px" }}
              >
                {message.type === "success" ? (
                  <CheckCircle2 size={18} className="flex-shrink-0" />
                ) : (
                  <AlertCircle size={18} className="flex-shrink-0" />
                )}
                <div>{message.text}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={signupUser}>
              {/* Name & Email Row */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label text-white-50 fw-semibold mb-1" style={{ fontSize: "13px" }}>
                    Full Name
                  </label>
                  <div className="position-relative">
                    <span 
                      className="position-absolute top-50 translate-middle-y text-white-50 ps-3"
                      style={{ pointerEvents: "none" }}
                    >
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      className="form-control text-white ps-5 pe-3 py-2 border rounded-3"
                      placeholder="e.g. Alex Johnson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        background: "rgba(30, 41, 59, 0.8)",
                        borderColor: "rgba(255, 255, 255, 0.15)",
                        fontSize: "14px"
                      }}
                    />
                  </div>
                </div>

                <div className="col-md-6">
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
                      placeholder="e.g. alex@example.com"
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
              </div>

              {/* Password & Confirm Password Row */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label text-white-50 fw-semibold mb-1" style={{ fontSize: "13px" }}>
                    Password
                  </label>
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
                      placeholder="Min 6 characters"
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

                <div className="col-md-6">
                  <label className="form-label text-white-50 fw-semibold mb-1" style={{ fontSize: "13px" }}>
                    Confirm Password
                  </label>
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
                      className={`form-control text-white ps-5 pe-3 py-2 border rounded-3 ${
                        confirmPassword && confirmPassword !== password ? "border-danger" : ""
                      }`}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        background: "rgba(30, 41, 59, 0.8)",
                        borderColor: confirmPassword && confirmPassword !== password ? "#ef4444" : "rgba(255, 255, 255, 0.15)",
                        fontSize: "14px"
                      }}
                    />
                  </div>
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
                    Creating Student Account...
                  </>
                ) : (
                  <>
                    Complete Registration & Enter Student Dashboard
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Login Link */}
            <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 text-center">
              <p className="text-white-50 mb-0" style={{ fontSize: "14px" }}>
                Already have an account?{" "}
                <Link 
                  to="/" 
                  className="fw-bold text-decoration-none"
                  style={{ color: "#38bdf8" }}
                >
                  Sign In here &rarr;
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;