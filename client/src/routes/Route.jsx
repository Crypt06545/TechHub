import { createBrowserRouter } from "react-router-dom";

import App from "@/App";
import Home from "@/pages/Home";
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";

import NotFound from "@/components/NotFound";
import ProductsPage from "@/pages/ProductPage";
import ProductDetails from "@/pages/ProductDetails";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Dashboard/Analytics";
import DashLayout from "@/pages/Dashboard/DashLayout";
import UserProfile from "@/pages/UserProfile";
import AllOrders from "@/pages/Dashboard/AllOrders";
import Customer from "@/pages/Dashboard/Customer";
import AllProducts from "@/pages/Dashboard/AllProducts";
import ForgotPasswordForm from "@/pages/Auth/ForgotPasswordForm";
import VerifyOtpForm from "@/pages/Auth/VerifyOtpForm";
import ResetPasswordForm from "@/pages/Auth/ResetPasswordForm";
import ProtectedRoute from "./ProtectedRoute";
import AllCategories from "@/pages/Dashboard/AllCategories";
import AllCoupons from "@/pages/Dashboard/AllCoupons";
import TrackOrderPage from "@/components/TrackOrderPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/Checkout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "/products", element: <ProductsPage /> },
      { path: "/products/:slug?", element: <ProductDetails /> },
      { path: "/profile", element: <UserProfile /> },
      { path: "/track-order", element: <TrackOrderPage /> },
      { path: "/cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
    ],
  },
  { path: "login", element: <Login /> },
  { path: "register", element: <Register /> },
  { path: "forgot-password", element: <ForgotPasswordForm /> },
  { path: "verify-otp", element: <VerifyOtpForm /> },
  { path: "reset-password", element: <ResetPasswordForm /> },

  // ── Dashboard ────────────────────────────────────
  {
    element: <ProtectedRoute roles={["Admin"]} />,
    children: [
      {
        path: "dashboard",
        element: <DashLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "analytics", element: <Analytics /> },
          { path: "products", element: <AllProducts /> },
          { path: "categories", element: <AllCategories /> },
          { path: "coupons", element: <AllCoupons /> },
          { path: "orders", element: <AllOrders /> },
          { path: "customers", element: <Customer /> },
        ],
      },
    ],
  },
  // 2. Full-screen catch-all outside of <App />
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
