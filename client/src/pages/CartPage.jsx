import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  Loader2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useCartStore, getLineId } from "@/store/cartStore"; // adjust path if needed
import { useAuth } from "@/hooks/useAuth";
import { AuthToast } from "@/components/common/AuthToast";

/* ── free shipping threshold ── */
const FREE_SHIPPING_AT = 2000;
const SHIPPING_FEE = 120;

/* ─────────────────────────────────────────────────────────────────────
   Empty state
───────────────────────────────────────────────────────────────────── */
const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white py-24 text-center">
    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-50">
      <ShoppingBag size={32} className="text-gray-300" strokeWidth={1.5} />
    </div>
    <div className="space-y-1">
      <p className="text-base font-semibold text-gray-900">
        Your cart is empty
      </p>
      <p className="text-sm text-gray-400">
        Looks like you haven't added anything yet
      </p>
    </div>
    <Link
      to="/products"
      className="mt-2 flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-gray-800"
    >
      Start Shopping <ArrowRight size={14} />
    </Link>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────
   Single cart row
───────────────────────────────────────────────────────────────────── */
const CartRow = ({ item, onRemove, onQty }) => {
  const lineId = getLineId(item);
  const lineTotal = item.price * item.quantity;
  const originalLine = item.originalPrice
    ? item.originalPrice * item.quantity
    : null;

  return (
    <div className="flex gap-4 py-5 sm:gap-5">
      {/* Product Image */}
      <Link
        to={`/products/${item.slug}`}
        className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 sm:h-24 sm:w-24"
      >
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover"
        />
      </Link>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        {/* Name + Trash */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/products/${item.slug}`}>
              <p className="line-clamp-2 text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors sm:text-[15px]">
                {item.name}
              </p>
            </Link>

            {/* Selected size/color, if this line has variants */}
            {item.size || item.color ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {item.size && (
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                    Size: {item.size}
                  </span>
                )}
                {item.color && (
                  <span className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-gray-300"
                      style={{ backgroundColor: item.color.toLowerCase() }}
                    />
                    {item.color}
                  </span>
                )}
              </div>
            ) : (
              item.variant && (
                <p className="mt-0.5 truncate text-xs text-gray-400">
                  {item.variant}
                </p>
              )
            )}

            {item.stock > 0 && item.stock <= 5 && (
              <p className="mt-1 text-[11px] font-medium text-orange-600">
                Only {item.stock} left in stock
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onRemove(lineId)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-red-50 hover:text-red-600"
            aria-label="Remove item"
          >
            <Trash2 size={16} strokeWidth={2.2} />
          </button>
        </div>

        {/* Qty + Price */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            <button
              onClick={() => onQty(lineId, item.quantity - 1)}
              className="flex h-9 w-9 items-center justify-center text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Minus size={14} />
            </button>

            <span className="flex h-9 w-10 items-center justify-center border-x border-gray-200 text-sm font-semibold">
              {item.quantity}
            </span>

            <button
              onClick={() => onQty(lineId, item.quantity + 1)}
              className="flex h-9 w-9 items-center justify-center text-gray-500 transition-colors hover:bg-orange-50 hover:text-orange-600"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">
              ৳ {lineTotal.toLocaleString()}
            </p>

            {originalLine && (
              <p className="text-[11px] text-gray-400 line-through">
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
   Promo code
───────────────────────────────────────────────────────────────────── */
const PromoCode = () => {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | applying | applied | error

  const handleApply = () => {
    if (!code.trim()) return;
    setStatus("applying");
    // Wire this up to your actual promo/coupon endpoint
    setTimeout(() => setStatus("error"), 700);
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Tag
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
          />
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setStatus("idle");
            }}
            placeholder="Promo code"
            className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-xs font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-300 focus:bg-white"
          />
        </div>
        <button
          onClick={handleApply}
          disabled={!code.trim() || status === "applying"}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-4 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "applying" && (
            <Loader2 size={13} className="animate-spin" />
          )}
          Apply
        </button>
      </div>
      {status === "error" && (
        <p className="mt-1.5 text-[11px] text-red-500">
          That code isn't valid or has expired
        </p>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   CartPage
───────────────────────────────────────────────────────────────────── */
const CartPage = () => {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      AuthToast.error("Please log in first to checkout");
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }
    navigate("/checkout");
  };

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const shippingFee =
    subtotal >= FREE_SHIPPING_AT || items.length === 0 ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;
  const remaining = FREE_SHIPPING_AT - subtotal;
  const progress = Math.min((subtotal / FREE_SHIPPING_AT) * 100, 100);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-5 flex items-center gap-1.5 text-xs text-gray-400">
        <Link to="/" className="hover:text-gray-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-700">Cart</span>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Shopping Cart
          </h1>
          {items.length > 0 && (
            <p className="mt-1 text-xs text-gray-400">
              {totalQty} {totalQty === 1 ? "item" : "items"} in your cart
            </p>
          )}
        </div>

        {items.length > 0 && (
          <Link
            to="/products"
            className="hidden items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors sm:flex"
          >
            <ArrowLeft size={13} />
            Continue shopping
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* ── Items column ─────────────────────────────────── */}
          <div className="lg:col-span-2">
            {/* free-shipping bar */}
            <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
              <div className="h-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-gray-500">
                {remaining > 0 ? (
                  <>
                    Add{" "}
                    <span className="font-semibold text-gray-800">
                      ৳{remaining.toLocaleString()}
                    </span>{" "}
                    more to unlock free shipping
                  </>
                ) : (
                  <span className="font-medium text-green-600">
                    ✓ You've unlocked free shipping
                  </span>
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white px-4 sm:px-6">
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <CartRow
                    key={getLineId(item)}
                    item={item}
                    onRemove={removeItem}
                    onQty={updateQty}
                  />
                ))}
              </div>
            </div>

            <Link
              to="/products"
              className="mt-4 flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors sm:hidden"
            >
              <ArrowLeft size={13} />
              Continue shopping
            </Link>
          </div>

          {/* ── Summary column ───────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h2 className="text-sm font-semibold text-gray-900">
                  Order Summary
                </h2>

                <div className="mt-4">
                  <PromoCode />
                </div>

                <Separator className="my-4" />

                <div className="space-y-2.5 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalQty} items)</span>
                    <span className="font-medium text-gray-900">
                      ৳ {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span
                      className={
                        shippingFee === 0
                          ? "font-medium text-green-600"
                          : "font-medium text-gray-900"
                      }
                    >
                      {shippingFee === 0 ? "Free" : `৳${shippingFee}`}
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    ৳{total.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="flex items-center justify-center gap-2 w-full h-10 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Checkout <ArrowRight size={14} />
                </button>

                <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                  <ShieldCheck size={13} />
                  Secure checkout, encrypted end to end
                </div>
              </div>

              {/* Trust signals */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                    <Truck size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      Fast delivery
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      Get it within 2–4 business days nationwide
                    </p>
                  </div>
                </div>

                <Separator className="my-3.5" />

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                    <RotateCcw size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      Easy returns
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      7-day return window on eligible items
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
