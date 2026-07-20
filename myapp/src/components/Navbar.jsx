import { Link, useLocation } from "react-router-dom";
import { Bell, Search, Settings, User } from "lucide-react";

function Navbar() {
  const location = useLocation();
  const username = localStorage.getItem("username");
  const userRole = localStorage.getItem("userRole");
  
  const isAuthPage = location.pathname === "/" || location.pathname === "/signup";
  const showSidebar = username && !isAuthPage;

  if (isAuthPage) return null;

  return (
    <nav 
      className="navbar navbar-light bg-white border-bottom py-2 sticky-top" 
      style={{ 
        marginLeft: showSidebar ? "260px" : "0",
        transition: "margin-left 0.3s ease",
        zIndex: 1000,
        height: "64px"
      }}
    >
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center flex-grow-1 gap-4">
          <div className="text-dark fw-semibold d-none d-md-block" style={{ fontSize: "16px" }}>
            {location.pathname.replace("/", "").replace(/-/g, " ").charAt(0).toUpperCase() + location.pathname.slice(2).replace(/-/g, " ") || "Dashboard"}
          </div>

          {userRole === "admin" && (
            <Link 
              to="/admin" 
              className="btn btn-primary btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-2 shadow-sm border-0"
              style={{ backgroundColor: "#4f46e5", fontSize: "12px" }}
            >
              <Settings size={14} /> Admin Panel
            </Link>
          )}
        </div>

        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-link text-muted p-2 hover-bg-light border-0">
            <Bell size={20} />
          </button>
          
          <div className="vr mx-1 text-light"></div>
          
          <div className="d-flex align-items-center gap-2 ps-2">
            <div className="text-end d-none d-lg-block">
              <div className="fw-bold text-dark" style={{ fontSize: "13px" }}>{username}</div>
              <div className={`fw-bold text-uppercase ${userRole === "admin" ? "text-primary" : "text-muted"}`} style={{ fontSize: "9px", letterSpacing: "0.5px" }}>
                {userRole === "admin" ? "System Admin" : "Student Learner"}
              </div>
            </div>
            <div 
              className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
              style={{ width: "36px", height: "36px", fontSize: "14px", backgroundColor: userRole === "admin" ? "#4f46e5" : "#6366f1" }}
            >
              {username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;