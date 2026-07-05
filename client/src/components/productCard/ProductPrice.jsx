import React from "react";

const ProductPrice = ({ price, oldPrice, stock }) => {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-base sm:text-lg font-bold">
          ৳ {price.toFixed(2)}
        </span>

        {oldPrice && (
          <span className="text-[11px] text-gray-400 line-through">
            ৳ {oldPrice.toFixed(2)}
          </span>
        )}
      </div>

      <span className="text-[11px] font-semibold text-green-600">{stock}</span>
    </div>
  );
};

export default ProductPrice;
