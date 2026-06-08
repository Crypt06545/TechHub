// PATH: src/components/products/productCard/AddToCartButton.jsx
import React, { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";

const AddToCartButton = ({ productId, stock = 5, outOfStock = false }) => {
  // একদম লোকাল রিঅ্যাক্ট স্টেট (কোনো স্টোর বা এপিআই নেই)
  const [quantity, setQuantity] = useState(0);

  // ১. প্রোডাক্ট আউট অফ স্টক থাকলে
  if (outOfStock || stock === 0) {
    return (
      <button
        disabled
        className="mt-1 flex h-9 w-full items-center justify-center rounded-lg bg-gray-100 text-sm font-medium text-gray-400 cursor-not-allowed"
      >
        Out of Stock
      </button>
    );
  }

  // ২. কার্ট যদি খালি থাকে (Quantity = 0), "Add to Cart" বাটন দেখাবে
  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={() => setQuantity(1)}
        className="mt-1 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-black text-sm font-medium text-white transition-all duration-200 hover:bg-gray-800"
      >
        <ShoppingCart size={15} />
        Add to Cart
      </button>
    );
  }

  // ৩. কার্টে অলরেডি থাকলে কোয়ান্টিটি কন্ট্রোলার [- 1 +] দেখাবে
  return (
    <div className="mt-1 flex h-9 w-full items-center overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* মাইনাস (-) বাটন */}
      <button
        type="button"
        onClick={() => setQuantity((prev) => prev - 1)}
        className="flex h-full w-10 items-center justify-center bg-gray-50 transition hover:bg-gray-100"
      >
        <Minus size={15} />
      </button>

      {/* বর্তমান কোয়ান্টিটি সংখ্যা */}
      <div className="flex flex-1 items-center justify-center text-sm font-semibold text-gray-700 select-none">
        {quantity}
      </div>

      {/* প্লাস (+) বাটন */}
      <button
        type="button"
        disabled={quantity >= stock}
        onClick={() => setQuantity((prev) => prev + 1)}
        className={`flex h-full w-10 items-center justify-center transition ${
          quantity >= stock
            ? "cursor-not-allowed bg-gray-100 text-gray-300"
            : "bg-gray-50 hover:bg-gray-100"
        }`}
      >
        <Plus size={15} />
      </button>
    </div>
  );
};

export default AddToCartButton;
