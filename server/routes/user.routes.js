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
import authMiddleware from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multerMiddleware.js";
import {
  registerLimiter,
  loginLimiter,
  otpRequestLimiter,
  otpVerifyLimiter,
} from "../middleware/rateLimiter.js";
import { checkAccountLock } from "../middleware/loginLockout.js";

const userRouter = Router();

// ─── Auth ─────────────────────────────────────────────────────────────────────

userRouter.post("/register", registerLimiter, registerUserController);
userRouter.post("/verify-email", otpVerifyLimiter, verifyEmailController);
userRouter.post("/login", loginLimiter, checkAccountLock, loginUserController);
userRouter.post("/refresh-token", refreshTokenController);
userRouter.post("/logout", authMiddleware, logoutUserController);

// ─── Password ─────────────────────────────────────────────────────────────────

userRouter.post(
  "/forgot-password",
  otpRequestLimiter,
  forgotPasswordController,
);
userRouter.post(
  "/verify-forgot-password-otp",
  otpVerifyLimiter,
  verifyForgotPasswordOtpController,
);
userRouter.post("/reset-password", otpVerifyLimiter, resetPasswordController);

// ─── Profile ──────────────────────────────────────────────────────────────────

userRouter.get("/me", authMiddleware, userDetailsController);
userRouter.put("/update-details", authMiddleware, updateUserDetailsController);
userRouter.patch(
  "/update-avatar",
  authMiddleware,
  upload.single("avatar"),
  updateAvatarController,
);

export default userRouter;
