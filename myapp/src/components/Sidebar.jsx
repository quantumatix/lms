import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Code2, 
  Sparkles, 
  AlertTriangle, 
  User, 
  Trophy,
  LogOut,
  Search,
  ChevronDown,
  BookOpen,
  Sword,
  Target,
  ChevronRight,
  Settings,
  UserCheck,
  Brain,
  FileText
} from "lucide-react";
import { useCourse } from "../context/CourseContext";
import { API_BASE } from "../config";

function Sidebar() {
  const username = localStorage.getItem("username") || "Learner";
  const userRole = localStorage.getItem("userRole");
  const location = useLocation();
  const [curriculum, setCurriculum] = useState([]);
  const { selectedCourse, setSelectedCourse, courses, refreshCourses } = useCourse();

  useEffect(() => {
    if (refreshCourses) {
      refreshCourses();
    }
  }, [location.pathname]);

  useEffect(() => {
    // Clear curriculum immediately so previous course lessons don't linger
    setCurriculum([]);
    const courseParam = selectedCourse?.id ? `&course_id=${selectedCourse.id}` : "";
    fetch(`${API_BASE}/lessons?username=${username}${courseParam}`)
      .then(res => res.json())
      .then(data => {
        const allLessons = Array.isArray(data) ? data.flatMap(cat => cat.lessons || []) : [];
        setCurriculum(allLessons);
      })
      .catch(err => console.log(err));
  }, [username, selectedCourse?.id]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const mainMenuItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/lessons", label: "Lessons", icon: BookOpen },
    { path: "/coding-practice", label: "Challenges", icon: Sword },
    { path: "/interview-prep", label: "Interview Prep", icon: UserCheck },
    { path: "/interview-generator", label: "Interview Generator", icon: Sparkles },
    { path: "/interview-session", label: "Interview Session", icon: Brain },
    { path: "/interview-dashboard", label: "Interview Dashboard", icon: Trophy },
    { path: "/interview-results", label: "Interview Results", icon: FileText }
  ];

  const personalItems = [
    { path: "/profile", label: "Profile", icon: User }
  ];

  const adminItems = userRole === "admin" ? [
    { path: "/admin", label: "Admin Panel", icon: Settings },
    { path: "/admin/ai-generator", label: "AI Generator", icon: Sparkles }
  ] : [];

  const NavItem = ({ path, label, icon: IconComponent }) => {
    const isActive = location.pathname === path;
    return (
      <Link
        to={path}
        className="d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none transition-all mb-1"
        style={{
          backgroundColor: isActive ? "#eff6ff" : "transparent",
          color: isActive ? "#4f46e5" : "#64748b",
          fontWeight: isActive ? "600" : "500",
          fontSize: "13px",
        }}
      >
        <IconComponent size={18} strokeWidth={isActive ? 2.5 : 2} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div
      className="d-flex flex-column"
      style={{
        width: "260px",
        height: "100vh",
        backgroundColor: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        padding: "24px 16px",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1040,
      }}
    >
      <div className="d-flex align-items-center mb-4 px-2">
        <div className="bg-primary text-white rounded-3 me-2 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px", backgroundColor: "#4f46e5" }}>
          <Code2 size={18} strokeWidth={2.5} />
        </div>
        <span className="fs-5 fw-bold text-dark">PyLearn</span>
      </div>

      <div className="mb-3 px-1">
        <div className="d-flex align-items-center gap-2 rounded-3 px-3 py-2 bg-light border">
          <BookOpen size={16} className="text-primary flex-shrink-0" />
          <select
            value={selectedCourse?.id || "python-core"}
            onChange={(e) => {
              const course = courses.find(c => c.id === e.target.value);
              if (course) setSelectedCourse(course);
            }}
            className="form-select form-select-sm border-0 bg-transparent fw-semibold text-dark p-0"
            style={{ fontSize: "13px", boxShadow: "none", cursor: "pointer" }}
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4 px-1 position-relative">
        <Search size={14} className="position-absolute text-muted" style={{ left: "15px", top: "11px" }} />
        <input 
          type="text" 
          placeholder="Search..." 
          className="form-control ps-5 rounded-3 bg-light border-0" 
          style={{ fontSize: "12px", height: "36px" }}
        />
      </div>

      <div className="flex-grow-1 overflow-y-auto custom-scrollbar px-1">
        <div className="mb-2">
          {mainMenuItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>

        <div className="text-uppercase text-muted fw-bold mt-4 mb-2 px-3" style={{ fontSize: "10px" }}>Curriculum</div>
        <div className="d-flex flex-column gap-1 mb-4">
          {curriculum.map((lesson, idx) => {
             const active = location.pathname === `/lessons/${lesson.id}`;
             return (
               <Link 
                 key={lesson.id} 
                 to={`/lessons/${lesson.id}`}
                 className="d-flex align-items-center gap-2 px-3 py-1.5 rounded-3 text-decoration-none transition-all"
                 style={{
                   backgroundColor: active ? "#eff6ff" : "transparent",
                   color: active ? "#4f46e5" : "#94a3b8",
                 }}
               >
                 <span className="fw-bold" style={{ fontSize: "10px", width: "15px" }}>{idx + 1}</span>
                 <span className="small text-truncate" style={{ fontWeight: active ? "600" : "400" }}>{lesson.title}</span>
               </Link>
             );
          })}
        </div>

        {userRole === "admin" && (
          <>
            <div className="text-uppercase text-muted fw-bold mt-2 mb-2 px-3" style={{ fontSize: "10px" }}>Admin</div>
            {adminItems.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </>
        )}
      </div>

      <div className="mt-auto pt-3 border-top px-1">
        <button onClick={handleLogout} className="btn btn-link d-flex align-items-center gap-3 px-3 py-2 w-100 rounded-3 text-decoration-none border-0 text-muted small fw-medium">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;