import sendEmail from "../config/sendEmail.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import crypto from "crypto";
import dotenv from "dotenv";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import generateOTP from "../utils/generateOTP.js";
import verifyOtpTemplate from "../utils/verifyOtpTemplate.js";
import jwt from "jsonwebtoken";
import userService from "../services/userService.js";

dotenv.config();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  path: "/",
};

/**
 * @desc    Register a new user and dispatch a secure verification token link via email
 * @route   POST /api/v1/users/register
 * @access  Public
 * @note    FUTURE: Implement a rate-limiter layer specific to registration endpoints to prevent SMTP spam vectors.
 */
export const registerUserController = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  try {
    await userService.register({ name, email, password });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          null,
          "User registered successfully. Please check your email to verify.",
        ),
      );
  } catch (error) {
    if (error.message === "EMAIL_ALREADY_EXISTS") {
      throw new ApiError(400, "Email already registered. Please login.");
    }
    throw new ApiError(500, error.message);
  }
});

/**
 * @desc    Verify user email status using unique hexadecimal query/body tokens
 * @route   GET/POST /api/v1/users/verify-email
 * @access  Public
 */
export const verifyEmailController = asyncHandler(async (req, res) => {
  const token = req.query.token || req.body.token;
  if (!token) throw new ApiError(400, "Verification token is missing");

  try {
    await userService.verifyEmail({ token });
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Email verified successfully!"));
  } catch (error) {
    throw new ApiError(400, "Invalid or expired verification link");
  }
});

/**
 * @desc    Authenticate user credentials, update login timeline, and establish HttpOnly cookies
 * @route   POST /api/v1/users/login
 * @access  Public
 * @note    FUTURE: Add IP tracking and multi-failure account locking policies to counter brute-force vectors.
 */
export const loginUserController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new ApiError(400, "Email and password are required");

  try {
    const { user, accessToken, refreshToken } = await userService.login({
      email,
      password,
    });

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 5 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { user }, "Login successful"));
  } catch (error) {
    if (error.message === "ACCOUNT_INACTIVE") {
      throw new ApiError(
        403,
        "Your account is inactive. Please contact admin.",
      );
    }
    throw new ApiError(400, "Invalid email or password");
  }
});

/**
 * @desc    Retrieve profile data for the currently authenticated session resource
 * @route   GET /api/v1/users/me
 * @access  Private
 */
export const userDetailsController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(400, "Unauthorized Access");

  try {
    const user = await userService.getUserDetails({ userId });
    return res
      .status(200)
      .json(
        new ApiResponse(200, { user }, "User details fetched successfully"),
      );
  } catch (error) {
    throw new ApiError(404, error.message);
  }
});

/**
 * @desc    Clear authorization tokens from cookies and neutralize refresh tracking states
 * @route   POST /api/v1/users/logout
 * @access  Private
 */
export const logoutUserController = asyncHandler(async (req, res) => {
  await userService.logout({ userId: req.user._id }); // ← was: { refreshToken }

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

/**
 * @desc    Upload new profile image stream to Cloudinary and synchronize model storage
 * @route   PATCH /api/v1/users/avatar
 * @access  Private
 * @note    FUTURE: Integrate sharp/stream pipelines to compress assets locally prior to Cloudinary egress.
 */
export const updateAvatarController = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Unauthorized - Please login first");
  }

  const cloudinaryResult = await uploadOnCloudinary(
    req.file.buffer,
    req.file.originalname || "avatar.jpg",
  );

  if (!cloudinaryResult || !cloudinaryResult.secure_url) {
    throw new ApiError(500, "Failed to upload avatar");
  }

  const newAvatarUrl = cloudinaryResult.secure_url;

  if (user.avatar && user.avatar.trim() !== "") {
    try {
      await deleteFromCloudinary(user.avatar);
    } catch (err) {
      console.error("Cloudinary deletion failed:", err);
    }
  }

  user.avatar = newAvatarUrl;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { avatar: newAvatarUrl },
        "Avatar updated successfully",
      ),
    );
});

/**
 * @desc    Modify subset updates of localized user master metadata variables
 * @route   PUT /api/v1/users/profile
 * @access  Private
 */
export const updateUserDetailsController = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Unauthorized - Please login first");
  const { name, mobile } = req.body;

  if (!name && !mobile)
    throw new ApiError(400, "At least one field is required to update");
  if (name && name.trim().length < 2)
    throw new ApiError(400, "Name must be at least 2 characters long");
  if (mobile && !/^[0-9]{10,15}$/.test(mobile))
    throw new ApiError(400, "Invalid mobile number");

  const updatedUser = await userService.updateProfile(req.user, {
    name,
    mobile,
  });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { name: updatedUser.name, mobile: updatedUser.mobile },
        "Profile updated",
      ),
    );
});

/**
 * @desc    Dispatch secure hashed operational reset OTP structures via SMTP layers
 * @route   POST /api/v1/users/forgot-password
 * @access  Public
 */
export const forgotPasswordController = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  // Swallow USER_NOT_FOUND silently — never reveal if email exists
  try {
    await userService.forgotPassword({ email });
  } catch (error) {
    if (error.message !== "USER_NOT_FOUND") {
      throw new ApiError(500, "Failed to send OTP");
    }
    // USER_NOT_FOUND → fall through silently
  }

  // Always return the same response regardless of whether user exists
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "If that email is registered, an OTP has been sent.",
      ),
    );
});

/**
 * @desc    Validate inbound identity OTP payload hashes against database state definitions
 * @route   POST /api/v1/users/verify-otp
 * @access  Public
 */
export const verifyForgotPasswordOtpController = asyncHandler(
  async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) throw new ApiError(400, "Email and otp are required");

    try {
      await userService.verifyOtp({ email, otp });
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            null,
            "OTP verified successfully. Proceed to reset.",
          ),
        );
    } catch (error) {
      throw new ApiError(
        400,
        error.message === "OTP_EXPIRED" ? "OTP expired." : "Invalid OTP",
      );
    }
  },
);

/**
 * @desc    Overwrite existing password credentials using verified multi-stage validation checks
 * @route   POST /api/v1/users/reset-password
 * @access  Public
 */
export const resetPasswordController = asyncHandler(async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;
  if (!email || !otp || !newPassword || !confirmPassword) {
    throw new ApiError(400, "All parameters are required");
  }
  if (newPassword !== confirmPassword)
    throw new ApiError(400, "Passwords do not match");
  if (newPassword.length < 8)
    throw new ApiError(400, "Password must be at least 8 characters long");

  try {
    await userService.resetPassword({ email, otp, newPassword });
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Password reset successfully"));
  } catch (error) {
    const errorMap = {
      OTP_EXPIRED: "OTP has expired. Please request a new one.",
      INVALID_OTP: "Invalid OTP.",
      USER_NOT_FOUND: "Password reset failed.", // don't reveal
    };
    throw new ApiError(
      400,
      errorMap[error.message] || "Password reset failed.",
    );
  }
});

/**
 * @desc    Validate active refresh JSON web tokens and issue rotational access tokens
 * @route   POST /api/v1/users/refresh-token
 * @access  Public
 * @note    FUTURE: Implement token reuse detection (Automatic family revocation) to protect compromised refresh keys.
 */
export const refreshTokenController = asyncHandler(async (req, res) => {
  const refreshToken =
    req?.cookies?.refreshToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!refreshToken) throw new ApiError(401, "Refresh token is missing");

  try {
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await userService.refreshSession(refreshToken);

    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: 5 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", newRefreshToken, {
      // ← also update the rotated refresh token cookie
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res
      .status(200)
      .json(
        new ApiResponse(200, { accessToken: newAccessToken }, "Token rotated"),
      );
  } catch (error) {
    throw new ApiError(401, error.message);
  }
});
