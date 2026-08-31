// PATH: src/components/products/productCard/ProductActions.jsx
// FILE: ProductActions.jsx

import React, { useState } from "react";
import { Heart, Eye, GitCompare } from "lucide-react";
import { useWishlistStore, getLineId } from "@/store/wishlistStore";
import QuickViewModal from "../products/QuickViewModal";


const ProductActions = ({
  slug,
  productId,
  image,
  title,
  subtitle,
  price,
  oldPrice,
  hasVariants,
  defaultVariant,
}) => {
  const [quickViewOpen, setQuickViewOpen] = useState(false);

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

  const handleQuickView = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setQuickViewOpen(true);
  };

  const handleCompareClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("Compare clicked for:", slug);
  };

  return (
    <>
      <div className="absolute right-2 top-2 z-[3] flex translate-x-2 flex-col gap-1.5 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
          className="flex size-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition-colors hover:text-red-500"
        >
          <Heart
            size={15}
            className={isWishlisted ? "fill-red-500 text-red-500" : ""}
          />
        </button>

        <button
          type="button"
          onClick={handleQuickView}
          aria-label="Quick view"
          className="flex size-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition-colors hover:text-gray-900"
        >
          <Eye size={15} />
        </button>

        <button
          type="button"
          onClick={handleCompareClick}
          aria-label="Compare"
          className="flex size-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition-colors hover:text-gray-900"
        >
          <GitCompare size={15} />
        </button>
      </div>

      <QuickViewModal
        slug={slug}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </>
  );
};

export default ProductActions;
