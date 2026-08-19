import React from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useCartStore, getLineId } from "@/store/cartStore";

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
  hasVariants = false,
  defaultVariant = null,
}) => {
  const addItem = useCartStore((s) => s.addItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);

  const lineId =
    hasVariants && defaultVariant
      ? `${productId}__${defaultVariant._id}`
      : productId;

  const quantity = useCartStore(
    (s) => s.items.find((i) => getLineId(i) === lineId)?.quantity ?? 0,
  );

  const handleAdd = () => {
    addItem({
      _id: productId,
      name: title,
      image,
      price,
      originalPrice: oldPrice ?? null,
      slug,
      variantId: hasVariants && defaultVariant ? defaultVariant._id : null,
      size:
        hasVariants && defaultVariant ? (defaultVariant.size ?? null) : null,
      color:
        hasVariants && defaultVariant ? (defaultVariant.color ?? null) : null,
    });
  };

  const handleIncrease = () => {
    if (quantity >= stock) return;
    updateQty(lineId, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity <= 1) {
      removeItem(lineId);
    } else {
      updateQty(lineId, quantity - 1);
    }
  };

  /* ── out of stock ─────────────────────────────────────── */
  if (outOfStock || stock === 0) {
    return (
      <button
        disabled
        className="flex h-9 w-full items-center justify-center rounded-md bg-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-400 cursor-not-allowed select-none"
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
        className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-gray-900 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-gray-700 active:scale-[.98]"
      >
        <ShoppingCart size={13} strokeWidth={2} />
        Add to Cart
      </button>
    );
  }

  /* ── in cart — qty controller ────────────────────────── */
  const atMax = quantity >= stock;

  return (
    <div className="flex h-9 w-full items-center rounded-md border border-gray-200 overflow-hidden bg-white">
      <button
        type="button"
        onClick={handleDecrease}
        className="flex h-full w-9 shrink-0 items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus size={13} strokeWidth={2.5} />
      </button>

      <div className="flex flex-1 items-center justify-center select-none">
        <span className="text-xs font-semibold text-gray-800">{quantity}</span>
      </div>

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
