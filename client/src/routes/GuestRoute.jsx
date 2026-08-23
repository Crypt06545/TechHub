import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import PageLoader from "@/components/common/PageLoader";

const GuestRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // 1. Loading state: Fetching user status on reload
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  // 2. Already logged in? Redirect to Home / Dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 3. Not logged in: Show Login / Register page
  return <Outlet />;
};

export default GuestRoute;
