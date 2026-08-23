import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "@/store/userStore";

const GuestRoute = () => {
  const user = useUserStore((state) => state.user);
  const isAuthenticated = !!user;

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
