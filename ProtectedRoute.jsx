import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const token =
    localStorage.getItem("meetmind_token") ||
    sessionStorage.getItem("meetmind_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;