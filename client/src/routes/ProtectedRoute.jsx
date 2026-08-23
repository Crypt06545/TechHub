import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { AuthToast } from "@/components/common/AuthToast";

const ProtectedRoute = ({ roles }) => {
  const user = useUserStore((state) => state.user);
  const location = useLocation();
  const hasShownToast = useRef(false);

  const isAuthenticated = !!user;

  useEffect(() => {
    if (!isAuthenticated && !hasShownToast.current) {
      hasShownToast.current = true;
      AuthToast.error("Please log in to continue");
    } else if (
      isAuthenticated &&
      roles &&
      !roles.includes(user?.role) &&
      !hasShownToast.current
    ) {
      hasShownToast.current = true;
      AuthToast.error("You don't have permission to access this page");
    }
  }, [isAuthenticated, user, roles]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
