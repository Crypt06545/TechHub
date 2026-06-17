import dotenv from "dotenv";
import ConnectDB from "./db/connectDB.js";
import { app } from "./app.js";
import { redis } from "./config/redis.js";

dotenv.config();

app.get("/", (req, res) => {
  res.json({
    message: "Server is running",
  });
});

ConnectDB().catch((err) => {
  console.log(`MONGODB Connection Failed ${err}`);
});

if (process.env.NODE_ENV !== "production") {
  app.listen(process.env.PORT || 8080, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}
