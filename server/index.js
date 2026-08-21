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

// REMOVE the NODE_ENV check so the server starts on Render
const PORT = process.env.PORT || 18012;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
