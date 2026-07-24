import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./components/common/Footer";
import ChatWidget from "./components/common/ChatWidget";
import Navbar from "./components/common/Navbar";
import ScrollToTop from "./components/common/ScrollToTop";
import NavLinks from "./components/common/navbar/NavLinks";
import { useGetProfile } from "./hooks/user.query";
import { useUserStore } from "./store/userStore";
import FloatingWhatsAppButton from "./components/common/Floatingwhatsappbutto";
import Marquee from "./components/common/Marquee";

function App() {
  const location = useLocation();
  const setUser = useUserStore((s) => s.setUser);
  const clearUser = useUserStore((s) => s.clearUser);
  const { data, isSuccess, isError } = useGetProfile();

  useEffect(() => {
    if (isSuccess && data?.data?.user) setUser(data.data.user);
    if (isError) clearUser();
  }, [isSuccess, isError, data, setUser, clearUser]);

  // Track route changes
  useEffect(() => {
    if (!window.gtag) return;
    window.gtag("event", "page_view", {
      page_path: location.pathname + location.search,
    });
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Marquee/>

      <div className="sticky top-0 z-50 lg:static">
        <Navbar />
      </div>

      <div className="hidden lg:block sticky top-0 z-50 w-full bg-gray-50 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 lg:px-6">
          <NavLinks />
        </div>
      </div>

      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
      <FloatingWhatsAppButton />
    </div>
  );
}

export default App;
