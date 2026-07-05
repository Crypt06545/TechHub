import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore"; // adjust path if needed

/* ── free shipping threshold ── */
const FREE_SHIPPING_AT = 2000;
const SHIPPING_FEE = 120;

/* ─────────────────────────────────────────────────────────────────────
   Empty state
───────────────────────────────────────────────────────────────────── */
const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center py-12">
    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
      <ShoppingBag size={28} className="text-gray-300" strokeWidth={1.5} />
    </div>
    <div className="space-y-0.5">
      <p className="text-sm font-medium text-gray-700">Your cart is empty</p>
      <p className="text-xs text-gray-400">Add items to get started</p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────
   Single cart row
───────────────────────────────────────────────────────────────────── */
const CartRow = ({ item, onRemove, onQty }) => {
  const lineTotal = item.price * item.quantity;
  const originalLine = item.originalPrice
    ? item.originalPrice * item.quantity
    : null;

  return (
    <div className="flex gap-3 py-3.5">
      {/* Product Image */}
      <img
        src={item.image}
        alt={item.name}
        className="h-14 w-14 shrink-0 rounded-xl border border-gray-100 bg-gray-50 object-cover"
      />

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        {/* Name + Trash */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-gray-900">
              {item.name}
            </p>

            {item.variant && (
              <p className="mt-0.5 truncate text-[11px] text-gray-400">
                {item.variant}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onRemove(item._id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-red-50 hover:text-red-600"
            aria-label="Remove item"
          >
            <Trash2 size={16} strokeWidth={2.2} />
          </button>
        </div>

        {/* Qty + Price */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            {/* Minus */}
            <button
              onClick={() => onQty(item._id, item.quantity - 1)}
              className="flex h-8 w-8 items-center justify-center text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Minus size={14} />
            </button>

            {/* Qty */}
            <span className="flex h-8 w-8 items-center justify-center border-x border-gray-200 text-xs font-semibold">
              {item.quantity}
            </span>

            {/* Plus */}
            <button
              onClick={() => onQty(item._id, item.quantity + 1)}
              className="flex h-8 w-8 items-center justify-center text-gray-500 transition-colors hover:bg-orange-50 hover:text-orange-600"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="text-right">
            <p className="text-xs font-bold text-gray-900">
              ৳ {lineTotal.toLocaleString()}
            </p>

            {originalLine && (
              <p className="text-[10px] text-gray-400 line-through">
                ৳ {originalLine.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   CartSidebar
───────────────────────────────────────────────────────────────────── */
const CartSidebar = ({ open, onOpenChange }) => {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const shippingFee =
    subtotal >= FREE_SHIPPING_AT || items.length === 0 ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;
  const remaining = FREE_SHIPPING_AT - subtotal;
  const progress = Math.min((subtotal / FREE_SHIPPING_AT) * 100, 100);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        /* hide shadcn's built-in close button */
        className="w-full sm:w-[380px] p-0 flex flex-col [&>button]:hidden"
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-gray-100 space-y-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-sm font-semibold text-gray-900 tracking-tight">
              Cart
              {totalQty > 0 && (
                <span className="ml-2 text-[11px] font-normal text-gray-400">
                  {totalQty} {totalQty === 1 ? "item" : "items"}
                </span>
              )}
            </SheetTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* free-shipping bar — only when items exist */}
          {items.length > 0 && (
            <div className="pt-3">
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">
                {remaining > 0 ? (
                  <>
                    Add{" "}
                    <span className="font-medium text-gray-700">
                      ৳{remaining.toLocaleString()}
                    </span>{" "}
                    more for free shipping
                  </>
                ) : (
                  <span className="text-green-600 font-medium">
                    ✓ Free shipping unlocked
                  </span>
                )}
              </p>
            </div>
          )}
        </SheetHeader>

        {/* ── Items ──────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 divide-y divide-gray-100">
          {items.length === 0 ? (
            <EmptyCart />
          ) : (
            items.map((item) => (
              <CartRow
                key={item._id}
                item={item}
                onRemove={removeItem}
                onQty={updateQty}
              />
            ))
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────── */}
        {items.length > 0 && (
          <div className="px-5 pt-4 pb-5 border-t border-gray-100 space-y-3">
            {/* summary */}
            <div className="space-y-1.5 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-gray-900 font-medium">
                  ৳ {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span
                  className={
                    shippingFee === 0
                      ? "text-green-600 font-medium"
                      : "text-gray-900 font-medium"
                  }
                >
                  {shippingFee === 0 ? "Free" : `৳${shippingFee}`}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-sm font-semibold text-gray-900">
                <span>Total</span>
                <span>৳{total.toLocaleString()}</span>
              </div>
            </div>

            {/* checkout CTA */}
            <Link
              to="/checkout"
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-center gap-2 w-full h-10 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Checkout <ArrowRight size={14} />
            </Link>

            {/* secondary */}
            <Link
              to="/cart"
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-center w-full h-8 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              View full cart
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;
