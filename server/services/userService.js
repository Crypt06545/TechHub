import userRepository from "../repositories/userRepository.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import sendEmail from "../config/sendEmail.js";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import generateOTP from "../utils/generateOTP.js";
import verifyOtpTemplate from "../utils/verifyOtpTemplate.js";

const userService = {
  // register
  register: async ({ name, email, password }) => {
    // find user
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    // hash password
    const salt = await bcryptjs.genSalt(12);
    const hashedPassword = await bcryptjs.hash(password, salt);
    const emailVerifyToken = crypto.randomBytes(32).toString("hex");

    // create new user
    const newUser = await userRepository.createUser({
      name,
      email,
      password: hashedPassword,
      email_verify_token: emailVerifyToken,
      email_verify_expiry: Date.now() + 3600000,
    });

    // send email
    const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerifyToken}`;
    sendEmail({
      sendTo: email,
      subject: "Verify your email - GroStore",
      html: verifyEmailTemplate({ name, url: verifyEmailUrl }),
    });

    return newUser;
  },

  //verify Email
  verifyEmail: async ({ token }) => {
    const user = await userRepository.findByVerifyToken(token);
    if (!user) throw new Error("INVALID_OR_EXPIRED_TOKEN");

    await userRepository.updateUserFields(user, {
      verify_email: true,
      email_verify_token: null,
      email_verify_expiry: null,
    });
  },

  // login
login: async ({ email, password }) => {
  const user = await userRepository.findByEmail(email, "+password");
  if (!user) throw new Error("INVALID_CREDENTIALS");

  if (user.status !== "Active") throw new Error("ACCOUNT_INACTIVE");

  const isPasswordValid = await bcryptjs.compare(password, user.password);
  if (!isPasswordValid) throw new Error("INVALID_CREDENTIALS");

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user._id);

  // security critical — blocking
  await userRepository.updateRefreshToken(user._id, refreshToken);

  // analytics — fire and forget
  userRepository
    .updateById(user._id, { last_login_date: new Date() })
    .catch(err => console.error("Non-critical:", err));

  return {
    user: { name: user.name, email: user.email },
    accessToken,
    refreshToken,
  };
},

  // get userDetails
  getUserDetails: async ({ userId }) => {
    const user = await userRepository.findById(
      userId,
      "-password -refresh_token",
    );

    if (!user) throw new Error("USER_NOT_FOUND");

    return user;
  },

  //logout
  logout: async ({ refreshToken }) => {
    if (refreshToken) {
      await userRepository.clearRefreshToken(refreshToken);
    }
  },

  //update details
  updateProfile: async (user, { name, mobile }) => {
    const updates = {};
    if (name) updates.name = name.trim();
    if (mobile) updates.mobile = mobile;
    return await userRepository.updateUserFields(user, updates);
  },

  //forgot password
  forgotPassword: async (email) => {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error("USER_NOT_FOUND");

    const otp = generateOTP();

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");

    await userRepository.updateUserFields(user, {
      forgot_password_otp: hashedOtp,
      forgot_password_expiry: Date.now() + 3600000,
    });

    //send email
    sendEmail({
      sendTo: user.email,
      subject: "Your Password Reset OTP - GroStore",
      html: verifyOtpTemplate({ name: user.name, otp }),
    });
  },

  //verify otp
  verifyOtp: async ({ email, otp }) => {
    const user = await userRepository.findByEmail(
      email,
      "+forgot_password_otp +forgot_password_expiry",
    );
    if (!user) throw new Error("USER_NOT_FOUND");

    if (
      !user.forgot_password_expiry ||
      user.forgot_password_expiry < Date.now()
    ) {
      throw new Error("OTP_EXPIRED");
    }
    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");
    if (hashedOtp !== user.forgot_password_otp) throw new Error("INVALID_OTP");

    await userRepository.updateById(user._id, {
      forgot_password_otp: "",
      forgot_password_expiry: "",
    });
  },
  //reset password
  resetPassword: async ({ email, otp, newPassword }) => {
    const user = await userRepository.findByEmail(
      email,
      "+forgot_password_otp +forgot_password_expiry",
    );
    if (!user) throw new Error("USER_NOT_FOUND");
    if (
      !user.forgot_password_expiry ||
      user.forgot_password_expiry < Date.now()
    ) {
      throw new Error("OTP_EXPIRED");
    }
    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");
    if (hashedOtp !== user.forgot_password_otp) throw new Error("INVALID_OTP");
    const salt = await bcryptjs.genSalt(12);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);
    await userRepository.updateUserFields(user, {
      password: hashedPassword,
      forgot_password_otp: "",
      forgot_password_expiry: "",
    });
  },
  //refreshSession
  refreshSession: async (refreshToken) => {
    let decode;
    try {
      decode = jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESHTOKEN);
    } catch {
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    const user = await userRepository.findById(decode?.id, "+refresh_token");
    if (!user) throw new Error("USER_NOT_FOUND");
    if (user.refresh_token !== refreshToken) throw new Error("TOKEN_MISMATCH");
    if (!user.verify_email) throw new Error("EMAIL_NOT_VERIFIED");

    return generateAccessToken(user);
  },
};

export default userService;
