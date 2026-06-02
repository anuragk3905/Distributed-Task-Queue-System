import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { Role } from "../../contexts/AuthContext";

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export const RoleRoute = ({ children, allowedRoles }: RoleRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
