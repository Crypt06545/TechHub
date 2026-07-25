import React from "react";
import { Star } from "lucide-react";

const ProductRating = ({ rating, reviews }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={11}
          className={
            i < Math.floor(rating)
              ? "fill-orange-400 text-orange-400"
              : "text-gray-300"
          }
        />
      ))}

      {/* <span className="text-[11px] text-gray-500">({reviews})</span> */}
    </div>
  );
};

export default ProductRating;
