// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import { DB_NAME } from "../constants.js";

// dotenv.config();

// const ConnectDB = async () => {
//   try {
//     const conn = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`, {
//       maxPoolSize: 10,
//       minPoolSize: 2,
//       serverSelectionTimeoutMS: 5000,
//       socketTimeoutMS: 45000,
//     });
//     console.log(`MongoDB Connected SuccessFully ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`Error: ${error.message}`);
//     process.exit(1);
//   }
// };

// export default ConnectDB;
import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "../constants.js";

dotenv.config();

let cached = global._mongooseConn;

if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

const ConnectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(`${process.env.MONGO_URI}/${DB_NAME}`, {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      })
      .then((conn) => {
        console.log(`MongoDB Connected SuccessFully ${conn.connection.host}`);
        return conn;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error(`Error: ${error.message}`);
    throw error;
  }

  return cached.conn;
};

export default ConnectDB;
