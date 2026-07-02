import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { Product } from "../models/product.model.js";
import Category from "../models/category.mode.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, "../.env"),
});

async function main() {
  try {
    console.log("Connecting...");

    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "TechHub",
    });
    console.log("✅ MongoDB Connected");

    console.log("Database:", mongoose.connection.name);

    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();

    console.log("Products:", totalProducts);
    console.log("Categories:", totalCategories);

    console.log("\n========= Categories =========");

    const categories = await Category.find().lean();

    categories.forEach((c) => {
      console.log(`${c.name} -> ${c._id}`);
    });

    console.log("\n========= Broken Products =========");

    const products = await Product.find()
      .populate("category", "name slug")
      .select("title category")
      .lean();

    const broken = products.filter((p) => !p.category);

    if (!broken.length) {
      console.log("✅ No broken products found.");
      process.exit(0);
    }

    console.log(`Found ${broken.length} broken products\n`);

    broken.forEach((p) => {
      console.log(`${p._id} -> ${p.title}`);
    });

    console.log("\nDone.");
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected.");
  }
}

main();
