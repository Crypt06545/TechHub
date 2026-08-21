// import dotenv from "dotenv";
// import ConnectDB from "./db/connectDB.js";
// import { app } from "./app.js";
// import { redis } from "./config/redis.js";

// dotenv.config();

// app.get("/", (req, res) => {
//   res.json({
//     message: "Server is running",
//   });
// });

// // Connect to Database
// ConnectDB().catch((err) => {
//   console.log(`MONGODB Connection Failed ${err}`);
// });

// // REMOVE the NODE_ENV check so the server starts on Render
// const PORT = process.env.PORT || 18012;

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server is running on port ${PORT}`);
// });
import dotenv from "dotenv";
import ConnectDB from "./db/connectDB.js";
import { app } from "./app.js";

dotenv.config();

app.get("/", (req, res) => {
  res.json({
    message: "Server is running",
  });
});

// Connect to Database
ConnectDB().catch((err) => {
  console.log(`MONGODB Connection Failed ${err}`);
});

// Vercel এ app.listen() চলবে না (serverless), তাই guard করা হলো
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 18012;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Vercel এইটা দিয়েই request handle করে (vercel.json এ index.js পয়েন্ট করা আছে)
export default app;
