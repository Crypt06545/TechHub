import { Outlet } from "react-router-dom";
import Footer from "./components/common/Footer";
import ChatWidget from "./components/common/ChatWidget";
// import { useGetProfile } from "./hooks/user.query";
import Navbar from "./components/common/Navbar";
import ScrollToTop from "./components/common/ScrollToTop";
import NavLinks from "./components/common/navbar/NavLinks";
// import { useGetProfile } from "./hooks/user.query";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <div className="sticky top-0 z-50 w-full bg-gray-50 border-b border-gray-200 shadow-sm hidden lg:block">
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
