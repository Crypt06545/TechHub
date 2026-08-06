// PATH: src/components/products/productCard/ProductActions.jsx
// FILE: ProductActions.jsx

import React from "react";
import { Eye, GitCompare } from "lucide-react";

const ProductActions = ({ slug }) => {
  const handleActionClick = (e, actionType) => {
    e.stopPropagation();
    e.preventDefault();

    if (actionType === "view") {
      console.log("Quick view clicked for:", slug);
    } else if (actionType === "compare") {
      console.log("Compare clicked for:", slug);
    }
  };

  return (
    <div className="absolute right-2 top-2 z-10 flex scale-90 flex-col gap-2 opacity-0 pointer-events-none transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 group-hover:pointer-events-auto">
      <button
        type="button"
        onClick={(e) => handleActionClick(e, "view")}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 active:scale-95"
      >
        <Eye size={15} />
      </button>

      <button
        type="button"
        onClick={(e) => handleActionClick(e, "compare")}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 active:scale-95"
      >
        <GitCompare size={15} />
      </button>
    </div>
  );
};

export default ProductActions;
