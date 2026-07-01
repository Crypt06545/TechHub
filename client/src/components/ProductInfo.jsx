import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  ArrowLeftRight,
  Star,
  Truck,
  RefreshCw,
  ShieldCheck,
  Link2,
  Check,
  Plus,
  Minus,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export const ProductInfo = ({ product }) => {
  const navigate = useNavigate();
  const { addItem, setItemQuantity, items } = useCartStore();

  const cartItem = items.find((i) => i._id === product._id);

  // Local qty — initialize from cart if already added, else 1
  const [qty, setQty] = useState(cartItem?.quantity ?? 1);
  const [copied, setCopied] = useState(false);

  const cartProduct = {
    _id: product._id,
    name: product.title,
    image:
      product.thumbnail ||
      product.images?.[0]?.url ||
      product.images?.[0] ||
      "",
    price: product.price,
    originalPrice: product.compareAtPrice ?? null,
    slug: product.slug,
    variant: product.variant ?? null,
  };

  // ── Qty controls ────────────────────────────────────────────────────────────
  const handleIncrement = () => {
    const next = Math.min(product.stock, qty + 1);
    setQty(next);
    // Keep cart in sync if item is already there
    if (cartItem) setItemQuantity(cartProduct, next);
  };

  const handleDecrement = () => {
    const next = Math.max(1, qty - 1);
    setQty(next);
    if (cartItem) setItemQuantity(cartProduct, next);
  };

  // ── Cart actions ────────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (qty > product.stock) return;
    // Always SET quantity, never accumulate
    setItemQuantity(cartProduct, qty);
  };

  const handleBuyNow = () => {
    if (qty > product.stock) return;
    setItemQuantity(cartProduct, qty);
    navigate("/checkout");
  };

  // ── Discount ────────────────────────────────────────────────────────────────
  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) *
          100,
      )
    : null;

  // ── Share ───────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    const shareData = {
      title: product?.title,
      text: `Check out this product on Senzo`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Title + rating + SKU */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2 leading-snug">
          {product.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-gray-700">
              {product.ratingAverage}
            </span>
            <span>({product.ratingCount} reviews)</span>
          </div>
          <span>·</span>
          <span>SKU: {product._id.slice(-8).toUpperCase()}</span>
        </div>
      </div>

      <Separator />

      {/* Price + description */}
      <div>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-3xl font-bold text-gray-900">
            ৳{product.price.toLocaleString()}
          </span>
          {product.compareAtPrice && (
            <>
              <span className="text-base text-gray-400 line-through">
                ৳{product.compareAtPrice.toLocaleString()}
              </span>
              {discount && (
                <Badge className="bg-red-50 text-red-600 border-0 font-medium text-xs">
                  -{discount}%
                </Badge>
              )}
            </>
          )}
        </div>
        <p className="text-gray-500 text-sm leading-relaxed">
          {product.description}
        </p>
      </div>

      <Separator />

      {/* Qty + Add to cart */}
      <div className="flex items-center gap-3">
        <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
          <button
            onClick={handleDecrement}
            disabled={qty <= 1 || product.stock === 0}
            className="flex h-10 w-10 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Minus size={15} strokeWidth={2.5} />
          </button>

          <span className="flex h-10 w-12 items-center justify-center border-x border-gray-200 text-sm font-semibold">
            {qty}
          </span>

          <button
            onClick={handleIncrement}
            disabled={qty >= product.stock || product.stock === 0}
            className="flex h-10 w-10 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={15} strokeWidth={2.5} />
          </button>
        </div>

        <Button
          className="flex-1 bg-gray-900 hover:bg-gray-700 text-white h-10"
          disabled={product.stock === 0}
          onClick={handleAddToCart}
        >
          {cartItem ? "Update Cart" : "Add to Cart"}
        </Button>
      </div>

      <Button
        variant="outline"
        className="w-full h-10 border-gray-300 text-gray-700 hover:bg-gray-50"
        disabled={product.stock === 0}
        onClick={handleBuyNow}
      >
        Buy Now
      </Button>

      {/* Meta actions */}
      <div className="flex items-center gap-5 text-sm text-gray-500">
        <button className="flex items-center gap-1.5 hover:text-gray-800 transition-colors">
          <Heart className="w-4 h-4" /> Add to Wishlist
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 hover:text-gray-800 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-green-500">Link copied</span>
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4" /> Share
            </>
          )}
        </button>
        <button className="flex items-center gap-1.5 hover:text-gray-800 transition-colors">
          <ArrowLeftRight className="w-4 h-4" /> Compare
        </button>
      </div>

      <Separator />

      {/* Delivery / return / stock */}
      <div className="flex flex-col gap-2.5 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 shrink-0" />
          <span>Estimated delivery: 3–5 business days</span>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 shrink-0" />
          <span>Return within 30 days. Taxes are non-refundable.</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          {product.stock > 0 ? (
            <span>
              Availability:{" "}
              <span className="text-green-600 font-medium">
                Only {product.stock} left in stock
              </span>
            </span>
          ) : (
            <span className="text-red-500 font-medium">Out of stock</span>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="text-sm text-gray-500">
        Category:{" "}
        <Link
          to={`/products?categories=${product.category?.slug}`}
          className="text-gray-700 hover:underline"
        >
          {product.category?.name}
        </Link>
      </div>
    </div>
  );
};
