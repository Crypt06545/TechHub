import { useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import PageLoader from "@/components/common/PageLoader";
import { AuthToast } from "@/components/common/AuthToast";

const ProtectedRoute = ({ roles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const toastShownRef = useRef(false);

  // 1. Loading Phase: Full Page Loader return korbe
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  // 2. Unauthenticated Check: Direct Toast show baseline render-e execute hobe
  if (!isAuthenticated) {
    if (!toastShownRef.current) {
      toastShownRef.current = true;
      AuthToast.error("Please log in to continue");
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Unauthorized Role Check
  if (roles && user?.role && !roles.includes(user.role)) {
    if (!toastShownRef.current) {
      toastShownRef.current = true;
      AuthToast.error("You don't have permission to access this page");
    }
    return <Navigate to="/" replace />;
  }

  // Reset toast ref when user is valid
  toastShownRef.current = false;

  // 4. Authenticated & Authorized
  return <Outlet />;
};

export default ProtectedRoute;
