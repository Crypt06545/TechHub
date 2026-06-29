// PATH: src/components/products/productCard/AddToCartButton.jsx
import React from "react";
import { ShoppingCart, Minus, Plus, Check } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

const AddToCartButton = ({
  productId,
  stock = 5,
  outOfStock = false,
  image,
  title,
  subtitle,
  price,
  oldPrice,
  slug,
}) => {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);

  const cartItem = items.find((i) => i._id === productId);
  const quantity = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    addItem({
      _id: productId,
      name: title,
      variant: subtitle ?? null,
      image: image,
      price: price,
      originalPrice: oldPrice ?? null,
      slug: slug,
    });
  };

  const handleIncrease = () => {
    if (quantity >= stock) return;
    updateQty(productId, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity <= 1) {
      removeItem(productId);
    } else {
      updateQty(productId, quantity - 1);
    }
  };

  /* ── out of stock ─────────────────────────────────────── */
  if (outOfStock || stock === 0) {
    return (
      <button
        disabled
        className="mt-1 flex h-9 w-full items-center justify-center rounded-lg bg-gray-100 text-xs font-medium text-gray-400 cursor-not-allowed select-none"
      >
        Out of Stock
      </button>
    );
  }

  /* ── not in cart ─────────────────────────────────────── */
  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={handleAdd}
        className="mt-1 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-gray-900 text-xs font-semibold text-white transition-colors hover:bg-gray-700 active:scale-[.98]"
      >
        <ShoppingCart size={13} strokeWidth={2} />
        Add to Cart
      </button>
    );
  }

  /* ── in cart — qty controller ────────────────────────── */
  const atMax = quantity >= stock;

  return (
    <div className="mt-1 flex h-9 w-full items-center rounded-lg border border-gray-200 overflow-hidden bg-white">
      {/* minus / remove */}
      <button
        type="button"
        onClick={handleDecrease}
        className="flex h-full w-9 shrink-0 items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus size={13} strokeWidth={2.5} />
      </button>

      {/* qty + check */}
      <div className="flex flex-1 items-center justify-center gap-1 select-none">
        <span className="text-xs font-semibold text-gray-800">{quantity}</span>
      </div>

      {/* plus */}
      <button
        type="button"
        onClick={handleIncrease}
        disabled={atMax}
        aria-label="Increase quantity"
        className={`flex h-full w-9 shrink-0 items-center justify-center transition-colors ${
          atMax
            ? "text-gray-300 cursor-not-allowed bg-gray-50"
            : "text-gray-500 hover:bg-gray-50 hover:text-orange-600"
        }`}
      >
        <Plus size={13} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default AddToCartButton;
