import { Router } from "express";
import {
  getAllUserController,
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
import {
  createCouponController,
  deleteCouponController,
  getAllCouponsController,
  getCouponByIdController,
  toggleCouponActiveController,
  updateCouponController,
} from "../controllers/coupon.controller.js";
import {
  createProductController,
  deleteProductController,
  toggleFeaturedController,
  updateProductController,
  getAdminProductsController,
} from "../controllers/product.contoller.js";

const adminRouter = Router();

adminRouter.use(adminAuthMiddleware);

// ─── Users ────────────────────────────────────────────────────────────────────

adminRouter.get("/users", getAllUserController);

// ─── Products ─────────────────────────────────────────────────────────────────

adminRouter.get("/products", getAdminProductsController);
adminRouter.post(
  "/products",
  upload.array("images", 5),
  createProductController,
);
adminRouter.put(
  "/products/:id",
  upload.array("images", 5),
  updateProductController,
);
adminRouter.delete("/products/:id", deleteProductController);
adminRouter.patch("/products/:id/featured", toggleFeaturedController);

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

adminRouter.post("/coupons", createCouponController);
adminRouter.get("/coupons", getAllCouponsController);
adminRouter.get("/coupons/:id", getCouponByIdController);
adminRouter.patch("/coupons/:id", updateCouponController);
adminRouter.patch("/coupons/:id", toggleCouponActiveController);

export default adminRouter;
