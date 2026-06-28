import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    // FIX: snapshot the price when the item is added to cart.
    // If the product price changes before checkout the user won't see
    // a surprise total. Compare priceAtAdd vs current price at checkout
    // and warn the user if it has changed.
    priceAtAdd: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// FIX: removed standalone { userId: 1 } index.
// The compound unique index below is a prefix superset — MongoDB
// can satisfy any query on userId alone using it.
cartProductSchema.index({ userId: 1, productId: 1 }, { unique: true });

const CartProductModel =
  mongoose.models.cartProduct ||
  mongoose.model("cartProduct", cartProductSchema);

export default CartProductModel;
