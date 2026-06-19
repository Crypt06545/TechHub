import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Footer from "./components/common/Footer";
import ChatWidget from "./components/common/ChatWidget";
import Navbar from "./components/common/Navbar";
import ScrollToTop from "./components/common/ScrollToTop";
import NavLinks from "./components/common/navbar/NavLinks";
import { useGetProfile } from "./hooks/user.query";
import { useUserStore } from "./store/userStore";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Dashboard/Analytics";

function App() {
  const setUser = useUserStore((s) => s.setUser);
  const clearUser = useUserStore((s) => s.clearUser);

  const { data, isSuccess, isError } = useGetProfile();

  useEffect(() => {
    if (isSuccess && data?.data?.user) setUser(data.data.user);
    if (isError) clearUser();
  }, [isSuccess, isError, data, setUser, clearUser]);

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />

      {/* Mobile: full navbar sticky | Desktop: scrolls away */}
      <div className="sticky top-0 z-50 lg:static">
        <Navbar />
      </div>

      {/* Desktop only: NavLinks sticky */}
      <div className="hidden lg:block sticky top-0 z-50 w-full bg-gray-50 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 lg:px-6">
          <NavLinks />
        </div>
      </div>

      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />

    </div>
  );
}

export default App;
