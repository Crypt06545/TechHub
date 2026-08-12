import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import hpp from "hpp";

import userRouter from "./routes/user.routes.js";
import AdminRouter from "./routes/admin.routes.js";
import productRouter from "./routes/product.route.js";
import chatRouter from "./routes/chat.routes.js";
import cartRouter from "./routes/cart.routes.js";
import wishlistRouter from "./routes/wishList.routes.js";
// import paymentRouter from "./routes/payment.routes.js";
import orderRouter from "./routes/order.routes.js";

import { globalRateLimiter } from "./middleware/rateLimiter.js";
import { blockBannedIPs } from "./middleware/blacklist.js";
import { sanitizeInputs } from "./middleware/sanitize.js";
import couponRouter from "./routes/coupon.route.js";

dotenv.config();
const app = express();

// REQUIRED for Render/Heroku/Nginx/Cloudflare — real client IP from X-Forwarded-For
app.set("trust proxy", 1);

// 1. Global security & CORS
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  }),
);
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

// payment webhook needs raw body — keep before json parser
// app.use("/api/v1/payment", paymentRouter);

// 2. Body parsers + input sanitization
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(sanitizeInputs);
app.use(hpp());
app.use(express.static("public"));

// 3. IP jail check — before rate limiter, cheapest possible reject
app.use(blockBannedIPs);

// 4. Global rate limiter
app.use("/api/v1", globalRateLimiter);

// 5. Feature routes
app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/wishlist", wishlistRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/coupons", couponRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/admin", AdminRouter);

export { app };
