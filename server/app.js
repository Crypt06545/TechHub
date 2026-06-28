import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";

import userRouter from "./routes/user.routes.js";
import AdminRouter from "./routes/admin.routes.js";
import productRouter from "./routes/product.route.js";
import chatRouter from "./routes/chat.routes.js";
import cartRouter from "./routes/cart.routes.js";
import wishlistRouter from "./routes/wishList.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import { globalRateLimiter } from "./middleware/globalRateLimiter.js";
import orderRouter from "./routes/order.routes.js";

dotenv.config();
const app = express();

// 1. Global security & CORS middlewares
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  }),
);
app.use(cookieParser());
app.use(morgan("dev")); // Added "dev" format string to fix morgan
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

app.use("/api/v1/payment", paymentRouter);

// 3. Body parsers for all subsequent routes
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// 4. Rate Limiter (Applied to all routes below this point)
app.use("/api/v1", globalRateLimiter);

// 5. Application Feature Routes
app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/wishlist", wishlistRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/admin", AdminRouter);

export { app };
