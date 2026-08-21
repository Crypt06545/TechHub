// PATH: src/components/products/ProductInfo.jsx
// FILE: ProductInfo.jsx

import { useState, useEffect, useMemo } from "react";
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
import { useWishlistStore, getLineId } from "@/store/wishlistStore";

// ─── Small presentational pieces (kept in-file since they're only used here) ──

const SizeSelector = ({ sizes, selected, onSelect, isAvailable }) => (
  <div className="flex flex-col gap-2">
    <span className="text-sm font-medium text-gray-900">
      Size
      {selected && (
        <span className="font-normal text-gray-500">: {selected}</span>
      )}
    </span>
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => {
        const available = isAvailable(size);
        const active = selected === size;
        return (
          <button
            key={size}
            type="button"
            disabled={!available}
            onClick={() => onSelect(size)}
            className={`h-9 min-w-[44px] rounded-lg border px-3 text-sm font-medium transition-colors ${
              active
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 text-gray-700 hover:border-gray-400"
            } ${!available ? "cursor-not-allowed opacity-40 line-through" : ""}`}
          >
            {size}
          </button>
        );
      })}
    </div>
  </div>
);

const ColorSelector = ({ colors, selected, onSelect, isAvailable }) => (
  <div className="flex flex-col gap-2">
    <span className="text-sm font-medium text-gray-900">
      Color
      {selected && (
        <span className="font-normal text-gray-500">: {selected}</span>
      )}
    </span>
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => {
        const available = isAvailable(color);
        const active = selected === color;
        return (
          <button
            key={color}
            type="button"
            disabled={!available}
            onClick={() => onSelect(color)}
            title={color}
            className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${
              active
                ? "border-gray-900 ring-1 ring-gray-900"
                : "border-gray-200 hover:border-gray-400"
            } ${!available ? "cursor-not-allowed opacity-40" : ""}`}
          >
            <span
              className="h-4 w-4 rounded-full border border-gray-300"
              style={{ backgroundColor: color.toLowerCase() }}
            />
            <span className="text-gray-700">{color}</span>
            {!available && (
              <span className="text-[10px] text-gray-400">(out of stock)</span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

// ─── Main component ────────────────────────────────────────────────────────────

export const ProductInfo = ({ product }) => {
  const navigate = useNavigate();
  const { setItemQuantity, items } = useCartStore();
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const wishlistItems = useWishlistStore((s) => s.items);

  const variants = product.variants || [];
  const hasVariants = product.hasVariants && variants.length > 0;

  // ── Derived option lists (recomputed only when variants change) ────────────
  const sizes = useMemo(
    () => [...new Set(variants.map((v) => v.size).filter(Boolean))],
    [variants],
  );
  const colors = useMemo(
    () => [...new Set(variants.map((v) => v.color).filter(Boolean))],
    [variants],
  );

  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? null);
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? null);

  // ── Resolve the exact variant matching the current selection ───────────────
  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null;
    return variants.find(
      (v) =>
        (sizes.length === 0 || v.size === selectedSize) &&
        (colors.length === 0 || v.color === selectedColor),
    );
  }, [hasVariants, variants, sizes, colors, selectedSize, selectedColor]);

  // ── Active price/stock reflect the chosen variant, else the base product ───
  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const activeStock = selectedVariant ? selectedVariant.stock : product.stock;
  const activeOutOfStock = hasVariants
    ? !selectedVariant || activeStock === 0
    : activeStock === 0;

  // ── Fixed discount % derived once from the base product's price vs
  //    compareAtPrice — this % never changes across variants ─────────────────
  const discountPercent = useMemo(() => {
    if (!product.compareAtPrice || !product.price) return null;
    return Math.round(
      ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
    );
  }, [product.compareAtPrice, product.price]);

  // ── The displayed "cut price" recalculates per-variant so the % stays fixed
  const activeCompareAtPrice = discountPercent
    ? Math.round(activePrice / (1 - discountPercent / 100))
    : null;

  // ── Cart wiring ──────────────────────────────────────────────────────────
  const cartItem = items.find(
    (i) =>
      i._id === product._id && i.variantId === (selectedVariant?._id ?? null),
  );

  const [qty, setQty] = useState(cartItem?.quantity ?? 1);
  const [copied, setCopied] = useState(false);

  // clamp qty whenever the active variant's stock changes
  useEffect(() => {
    setQty((q) => Math.min(Math.max(q, 1), activeStock || 1));
  }, [activeStock]);

  const productImage =
    product.thumbnail || product.images?.[0]?.url || product.images?.[0] || "";

  const cartProduct = {
    _id: product._id,
    name: product.title,
    image: productImage,
    price: activePrice,
    originalPrice: activeCompareAtPrice ?? null,
    slug: product.slug,
    variantId: selectedVariant?._id ?? null,
    size: selectedVariant?.size ?? null,
    color: selectedVariant?.color ?? null,
  };

  // ── Wishlist wiring — same variant-aware shape as the cart line above ──────
  const wishlistProduct = {
    _id: product._id,
    name: product.title,
    image: productImage,
    subtitle: product.category?.name ?? null,
    price: activePrice,
    oldPrice: activeCompareAtPrice ?? null,
    slug: product.slug,
    variantId: selectedVariant?._id ?? null,
    size: selectedVariant?.size ?? null,
    color: selectedVariant?.color ?? null,
  };

  const isWishlisted = wishlistItems.some(
    (i) => getLineId(i) === getLineId(wishlistProduct),
  );

  const handleWishlistToggle = () => {
    toggleWishlist(wishlistProduct);
  };

  const handleIncrement = () => {
    const next = Math.min(activeStock, qty + 1);
    setQty(next);
    if (cartItem) setItemQuantity(cartProduct, next);
  };

  const handleDecrement = () => {
    const next = Math.max(1, qty - 1);
    setQty(next);
    if (cartItem) setItemQuantity(cartProduct, next);
  };

  const handleAddToCart = () => {
    if (activeOutOfStock || qty > activeStock) return;
    setItemQuantity(cartProduct, qty);
  };

  const handleBuyNow = () => {
    if (activeOutOfStock || qty > activeStock) return;
    setItemQuantity(cartProduct, qty);
    navigate("/checkout");
  };

  // an option greys out only if every variant carrying it is fully sold out,
  // regardless of the other dimension currently selected
  const isSizeAvailable = (size) =>
    variants.some((v) => v.size === size && v.stock > 0);
  const isColorAvailable = (color) =>
    variants.some((v) => v.color === color && v.stock > 0);

  const handleShare = async () => {
    const shareData = {
      title: product?.title,
      text: `Check out this product on ZUHR`,
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
            {/* <span>({product.ratingCount} reviews)</span> */}
          </div>
          <span> | </span>
          <span>SKU: {product.sku || product._id.slice(-8).toUpperCase()}</span>
        </div>
      </div>

      <Separator />

      {/* Price — discountPercent stays fixed across variants; the cut price
          (activeCompareAtPrice) recalculates so that % holds true */}
      <div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-gray-900">
            ৳ {activePrice.toLocaleString()}
          </span>
          {activeCompareAtPrice && (
            <>
              <span className="text-base text-gray-400 line-through">
                ৳ {activeCompareAtPrice.toLocaleString()}
              </span>
              {discountPercent > 0 && (
                <Badge className="bg-red-50 text-red-600 border-0 font-medium text-xs">
                  -{discountPercent}%
                </Badge>
              )}
            </>
          )}
        </div>
      </div>

      {/* Variant selectors */}
      {hasVariants && (
        <>
          <Separator />
          {sizes.length > 0 && (
            <SizeSelector
              sizes={sizes}
              selected={selectedSize}
              onSelect={setSelectedSize}
              isAvailable={isSizeAvailable}
            />
          )}
          {colors.length > 0 && (
            <ColorSelector
              colors={colors}
              selected={selectedColor}
              onSelect={setSelectedColor}
              isAvailable={isColorAvailable}
            />
          )}
          {!selectedVariant && (
            <p className="text-xs text-amber-600">
              This combination isn't available — try a different size or color.
            </p>
          )}
        </>
      )}

      <Separator />

      {/* Qty + Add to cart */}
      <div className="flex items-center gap-3">
        <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
          <button
            onClick={handleDecrement}
            disabled={qty <= 1 || activeOutOfStock}
            className="flex h-10 w-10 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Minus size={15} strokeWidth={2.5} />
          </button>

          <span className="flex h-10 w-12 items-center justify-center border-x border-gray-200 text-sm font-semibold">
            {qty}
          </span>

          <button
            onClick={handleIncrement}
            disabled={qty >= activeStock || activeOutOfStock}
            className="flex h-10 w-10 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={15} strokeWidth={2.5} />
          </button>
        </div>

        <Button
          className="flex-1 bg-gray-900 hover:bg-gray-700 text-white h-10"
          disabled={activeOutOfStock}
          onClick={handleAddToCart}
        >
          {cartItem ? "Update Cart" : "Add to Cart"}
        </Button>
      </div>

      <Button
        variant="outline"
        className="w-full h-10 border-gray-300 text-gray-700 hover:bg-gray-50"
        disabled={activeOutOfStock}
        onClick={handleBuyNow}
      >
        Buy Now
      </Button>

      {/* Meta actions */}
      <div className="flex items-center gap-5 text-sm text-gray-500">
        <button
          onClick={handleWishlistToggle}
          className={`flex items-center gap-1.5 transition-colors ${
            isWishlisted ? "text-red-500" : "hover:text-gray-800"
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500" : ""}`} />
          {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
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
          {activeStock > 0 ? (
            <span>
              Availability:{" "}
              <span className="font-medium text-green-600">In Stock</span>
            </span>
          ) : (
            <span>
              Availability:{" "}
              <span className="font-medium text-red-600">Out of Stock</span>
            </span>
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
