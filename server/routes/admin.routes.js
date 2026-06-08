import { Router } from "express";
import {
  getAllUserController,
  addProductController,
  updateProductController,
  deleteProductController,
  toggleFeaturedProduct,
  AddCategoryController,
  updateCategoryController,
  getAllCategoryController,
  adminGetAllOrdersController,
  adminUpdateOrderStatusController,
  getDashboardController,
  getRevenueAnalyticsController,
  getTopProductsController,
  getNewUsersAnalyticsController,
} from "../controllers/admin.controller.js";
import adminAuthMiddleware from "../middleware/adminMiddleware.js";
import { upload } from "../middleware/multerMiddleware.js";

const adminRouter = Router();

adminRouter.use(adminAuthMiddleware);

// ─── Users ────────────────────────────────────────────────────────────────────

adminRouter.get("/users", getAllUserController);

// ─── Products ─────────────────────────────────────────────────────────────────

adminRouter.post("/products", upload.array("images", 5), addProductController);
adminRouter.put(
  "/products/:id",
  upload.array("images", 5),
  updateProductController,
);
adminRouter.delete("/products/:id", deleteProductController);
adminRouter.patch("/products/:id/featured", toggleFeaturedProduct);

// ─── Categories ───────────────────────────────────────────────────────────────

adminRouter.get("/categories", getAllCategoryController);
adminRouter.post("/categories", upload.single("image"), AddCategoryController);
adminRouter.put(
  "/categories/:id",
  upload.single("image"),
  updateCategoryController,
);

// ─── Orders ───────────────────────────────────────────────────────────────────

adminRouter.get("/orders", adminGetAllOrdersController);
adminRouter.patch("/orders/:id/status", adminUpdateOrderStatusController);

// ─── Analytics ────────────────────────────────────────────────────────────────

adminRouter.get("/dashboard", getDashboardController);
adminRouter.get("/analytics/revenue", getRevenueAnalyticsController);
adminRouter.get("/analytics/top-products", getTopProductsController);
adminRouter.get("/analytics/new-users", getNewUsersAnalyticsController);

export default adminRouter;
