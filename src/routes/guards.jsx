import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingScreen from "@/components/feedback/LoadingScreen";
import { getAuthRedirectPath } from "@/features/auth/utils/authRedirect";
import { ROLES } from "@/features/auth/constants/roles";

// Use this around pages that require any logged-in user.
export function ProtectedRoute() {
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const status = useSelector((state) => state.auth.status);

  if (status === "checking") {
    return <LoadingScreen label="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

// Use this inside ProtectedRoute when a page belongs to specific roles only.
export function RoleRoute({ roles = [] }) {
  const user = useSelector((state) => state.auth.user);
  const status = useSelector((state) => state.auth.status);

  if (status === "checking") {
    return <LoadingScreen label="Checking permissions..." />;
  }

  if (!user) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={getAuthRedirectPath(user.role)} replace />;
  }

  return <Outlet />;
}

// Use this around auth pages, so logged-in users do not see login/register again.
export function PublicOnlyRoute({ children }) {
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const status = useSelector((state) => state.auth.status);

  if (status === "checking") {
    return <LoadingScreen label="Checking your session..." />;
  }

  if (isAuthenticated && user) {
    const home = getAuthRedirectPath(user.role);
    return <Navigate to={home} replace />;
  }

  return children;
}



