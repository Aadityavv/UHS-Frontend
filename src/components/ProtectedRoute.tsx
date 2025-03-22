import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles?: string[]; // optional if you want to protect by roles
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("roles");

  // ✅ Block access if no token
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // ✅ If you want to restrict by role
  if (allowedRoles && !allowedRoles.includes(role || "")) {
    return <Navigate to="/" replace />;
  }

  // ✅ Authorized user can access the children
  return <Outlet />;
};

export default ProtectedRoute;
