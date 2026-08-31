// FILE: utils/backfillOrderCosts.js

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import ConnectDB from "../db/connectDB.js";
import Order from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import {
  GATEWAY_FEE_RATES,
  DEFAULT_PACKAGING_COST,
} from "./inventoryConstants.js";

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing.");
  }

  await ConnectDB();

  console.log("Fetching ALL orders to ensure 100% complete backfill...");

  // কোনো ফিল্টার ছাড়া সম্পূর্ণ ২৪৫টি অর্ডার নিয়ে আসা হচ্ছে
  const orders = await Order.find({}).lean();

  console.log(`Found ${orders.length} total orders in database`);
  if (orders.length === 0) {
    console.log("No orders found.");
    await mongoose.disconnect();
    process.exit(0);
  }

  // ১. সব Product IDs একসাথে সংগ্রহ করা
  const allProductIds = [
    ...new Set(
      orders.flatMap((order) =>
        order.items.map((i) => i.productId?.toString()),
      ),
    ),
  ].filter(Boolean);

  console.log(`Fetching ${allProductIds.length} related products...`);

  const products = await Product.find({ _id: { $in: allProductIds } })
    .select("costPrice variants category")
    .lean();

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const bulkOperations = [];

  for (const order of orders) {
    const updatedItems = order.items.map((item) => {
      const itemObj = { ...item };
      const product = productMap.get(item.productId?.toString());

      // costPriceAtSale না থাকলে বা undefined/null হলে প্রোডাক্টের কস্ট প্রাইস বসানো
      if (
        itemObj.costPriceAtSale === undefined ||
        itemObj.costPriceAtSale === null
      ) {
        const costPrice =
          itemObj.variantId && product
            ? product.variants?.find(
                (v) => v._id.toString() === itemObj.variantId.toString(),
              )?.costPrice
            : product?.costPrice;

        itemObj.costPriceAtSale = costPrice || 0;
      }

      // category মিসিং থাকলে প্রোডাক্টের ক্যাটাগরি সেট করা
      if (!itemObj.category && product?.category) {
        itemObj.category = product.category;
      }

      return itemObj;
    });

    const gatewayFee = Math.round(
      (order.totalAmt || 0) * (GATEWAY_FEE_RATES[order.payment_method] || 0),
    );

    const costs = {
      courierCost: order.costs?.courierCost ?? null,
      packagingCost: order.costs?.packagingCost ?? DEFAULT_PACKAGING_COST,
      gatewayFee: order.costs?.gatewayFee ?? gatewayFee,
      returnCost: order.costs?.returnCost ?? null,
    };

    const stockRestored =
      order.stockRestored ?? order.order_status === "Cancelled";

    bulkOperations.push({
      updateOne: {
        filter: { _id: order._id },
        update: {
          $set: {
            items: updatedItems,
            costs: costs,
            stockRestored: stockRestored,
          },
        },
      },
    });
  }

  console.log(
    `Executing bulk update for all ${bulkOperations.length} orders...`,
  );
  const result = await Order.bulkWrite(bulkOperations);

  console.log(
    `Successfully updated/verified ${result.matchedCount} orders! (${result.modifiedCount} modified)`,
  );

  await mongoose.disconnect();
  if (global._mongooseConn) {
    global._mongooseConn = { conn: null, promise: null };
  }
  process.exit(0);
};

run().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
