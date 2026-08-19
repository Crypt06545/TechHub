import React from "react";

const ProductPrice = ({ price, oldPrice }) => {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-sm font-bold text-gray-900 sm:text-base">
        ৳ {price.toFixed(2)}
      </span>

      {oldPrice && (
        <span className="text-xs text-gray-400 line-through">
          ৳ {oldPrice.toFixed(2)}
        </span>
      )}
    </div>
  );
};

export default ProductPrice;
