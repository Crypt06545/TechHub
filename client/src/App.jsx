import { Outlet } from "react-router-dom";
import Footer from "./components/common/Footer";
import ChatWidget from "./components/common/ChatWidget";
// import { useGetProfile } from "./hooks/user.query";
import Navbar from "./components/common/Navbar";
import ScrollToTop from "./components/common/ScrollToTop";
// import { useGetProfile } from "./hooks/user.query";

function App() {
  // const { data } = useGetProfile();
  // console.log(data);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <ScrollToTop/>
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      {/* Global Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
}

export default App;
