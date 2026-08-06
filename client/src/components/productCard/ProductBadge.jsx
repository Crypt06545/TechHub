// PATH: src/components/products/productCard/ProductBadge.jsx
// FILE: ProductBadge.jsx

import React from "react";
import { Heart } from "lucide-react";
import { useWishlistStore, getLineId } from "@/store/wishlistStore";

const badgeStyles = {
  warning: "bg-orange-50 text-orange-500",
  sale: "bg-red-50 text-red-600",
  success: "bg-emerald-50 text-emerald-600",
  dark: "bg-gray-100 text-gray-700",
  // Custom marketing badges — matched by exact text
  "Hot Deal": "bg-red-50 text-red-600",
  "New Arrival": "bg-blue-50 text-blue-600",
  "Best Seller": "bg-amber-50 text-amber-700",
  "Top Rated": "bg-violet-50 text-violet-600",
  "Limited Stock": "bg-rose-50 text-rose-600",
  Trending: "bg-fuchsia-50 text-fuchsia-600",
};

const getBadgeClass = (badge) => {
  if (!badge) return "";
  // exact text match takes priority (custom badges), fall back to type
  return (
    badgeStyles[badge.text] ||
    badgeStyles[badge.type] ||
    "bg-gray-50 text-gray-600"
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
    <div className="mb-2 flex items-center justify-between gap-2 min-h-[24px] relative z-10">
      {badge?.text ? (
        <span
          className={`rounded-md px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold ${getBadgeClass(badge)}`}
        >
          {badge.text}
        </span>
      ) : (
        <div></div>
      )}

      <button
        type="button"
        onClick={handleWishlistClick}
        className="text-gray-400 hover:text-red-500 transition-colors p-1"
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
