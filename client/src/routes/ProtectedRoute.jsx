import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import PageLoader from "@/components/common/PageLoader";
import { AuthToast } from "@/components/common/AuthToast";

const ProtectedRoute = ({ roles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !hasShownToast.current) {
      hasShownToast.current = true;
      AuthToast.error("Please log in to continue");
    } else if (
      isAuthenticated &&
      roles &&
      !roles.includes(user.role) &&
      !hasShownToast.current
    ) {
      hasShownToast.current = true;
      AuthToast.error("You don't have permission to access this page");
    }
  }, [isLoading, isAuthenticated, user, roles]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
