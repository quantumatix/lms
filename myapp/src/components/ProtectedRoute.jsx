import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, requiredRole }) {
  const username = localStorage.getItem("username");
  const userRole = localStorage.getItem("userRole");

  if (!username) {
    return <Navigate to="/" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // If a student tries to access admin, send to dashboard
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default ProtectedRoute;