import { Router } from "express";
import {
  forgotPasswordController,
  loginUserController,
  logoutUserController,
  refreshTokenController,
  registerUserController,
  resetPasswordController,
  updateAvatarController,
  updateUserDetailsController,
  userDetailsController,
  verifyEmailController,
  verifyForgotPasswordOtpController,
} from "../controllers/user.controller.js";
import {
  placeCodOrderController,
  getUserOrdersController,
  getSingleOrderController,
} from "../controllers/order.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multerMiddleware.js";
import { otpRateLimiter } from "../middleware/otpRateLimiter.js";

const userRouter = Router();

// ─── Auth ─────────────────────────────────────────────────────────────────────

userRouter.post("/register", registerUserController);
userRouter.post("/verify-email", otpRateLimiter, verifyEmailController);
userRouter.post("/login", loginUserController);
userRouter.post("/refresh-token", refreshTokenController);
userRouter.post("/logout", authMiddleware, logoutUserController);

// ─── Password ─────────────────────────────────────────────────────────────────

userRouter.post("/forgot-password", otpRateLimiter, forgotPasswordController);
userRouter.post(
  "/verify-forgot-password-otp",
  otpRateLimiter,
  verifyForgotPasswordOtpController,
);
userRouter.post("/reset-password", otpRateLimiter, resetPasswordController);

// ─── Profile ──────────────────────────────────────────────────────────────────

userRouter.get("/me", authMiddleware, userDetailsController);
userRouter.put("/update-details", authMiddleware, updateUserDetailsController);
userRouter.patch(
  "/update-avatar",
  authMiddleware,
  upload.single("avatar"),
  updateAvatarController,
);

// ─── Orders ───────────────────────────────────────────────────────────────────

userRouter.post("/orders/cod", authMiddleware, placeCodOrderController);
userRouter.get("/orders", authMiddleware, getUserOrdersController);
userRouter.get("/orders/:id", authMiddleware, getSingleOrderController);

export default userRouter;
