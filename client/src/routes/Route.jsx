// router.jsx
import { createBrowserRouter } from "react-router-dom";

import App from "@/App";
import Home from "@/pages/Home";
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";

import NotFound from "@/components/NotFound";
import ProductsPage from "@/pages/ProductPage";
import ProductDetails from "@/pages/ProductDetails";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "/products", element: <ProductsPage /> },
      { path: "/products/:slug?", element: <ProductDetails /> },
    ],
  },
  { path: "login", element: <Login /> },
  { path: "register", element: <Register /> },
  // 2. Full-screen catch-all outside of <App />
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
