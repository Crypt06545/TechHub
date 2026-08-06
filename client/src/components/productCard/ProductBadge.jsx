// PATH: src/components/products/productCard/ProductBadge.jsx
// FILE: ProductBadge.jsx

import React from "react";
import { Heart } from "lucide-react";
import { useWishlistStore, getLineId } from "@/store/wishlistStore";

// Tinted background + matching text + a thin matching border — reads as
// deliberate and calm rather than loud. Keyed lowercase so it can never
// silently miss a match on casing ("Hot Deal" vs "hot deal").
const badgeStyles = {
  warning: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  sale: "bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-200",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  dark: "bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200",
  featured: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
  "hot deal": "bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-200",
  "new arrival": "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
  "best seller": "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  "top rated": "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
  "limited stock":
    "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
  trending: "bg-fuchsia-50 text-fuchsia-700 ring-1 ring-inset ring-fuchsia-200",
};

const getBadgeClass = (badge) => {
  if (!badge) return "";
  const key = (badge.text || badge.type || "").toLowerCase();
  return (
    badgeStyles[key] ||
    "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200"
  );
};

const ProductBadge = ({
  badge,
  productId,
  image,
  title,
  subtitle,
  price,
  oldPrice,
  slug,
  hasVariants,
  defaultVariant,
}) => {
  const lineId =
    hasVariants && defaultVariant
      ? `${productId}__${defaultVariant._id}`
      : productId;

  const isWishlisted = useWishlistStore((s) =>
    s.items.some((i) => getLineId(i) === lineId),
  );
  const toggleItem = useWishlistStore((s) => s.toggleItem);

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleItem({
      _id: productId,
      image,
      name: title,
      subtitle,
      price,
      oldPrice,
      slug,
      variantId: hasVariants && defaultVariant ? defaultVariant._id : null,
      size:
        hasVariants && defaultVariant ? (defaultVariant.size ?? null) : null,
      color:
        hasVariants && defaultVariant ? (defaultVariant.color ?? null) : null,
    });
  };

  return (
    <div className="mb-2 flex min-h-[24px] items-center justify-between gap-2 relative z-10">
      {badge?.text ? (
        <span
          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold sm:text-[11px] ${getBadgeClass(badge)}`}
        >
          {badge.text}
        </span>
      ) : (
        <span />
      )}

      <button
        type="button"
        onClick={handleWishlistClick}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={isWishlisted}
        className="rounded-full p-1 text-gray-400 transition-colors hover:text-red-500"
      >
        <Heart
          size={17}
          className={isWishlisted ? "fill-red-500 text-red-500" : ""}
        />
      </button>
    </div>
  );
};

export default ProductBadge;
