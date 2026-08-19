import React from "react";

const badgeStyles = {
  warning: "bg-stone-100 text-stone-700 ring-1 ring-inset ring-stone-200",
  sale: "bg-[#F7EAEA] text-[#8B4545] ring-1 ring-inset ring-[#E8CFCF]",
  success: "bg-[#EAF3EE] text-[#35624A] ring-1 ring-inset ring-[#CFE2D7]",
  dark: "bg-gray-900 text-white",

  featured: "bg-stone-100 text-stone-800 ring-1 ring-inset ring-stone-200",
  "hot deal": "bg-[#F7EAEA] text-[#8B4545] ring-1 ring-inset ring-[#E8CFCF]",
  "new arrival": "bg-stone-100 text-stone-700 ring-1 ring-inset ring-stone-200",
  "best seller": "bg-[#F5F0E3] text-[#765F2E] ring-1 ring-inset ring-[#E4D8B8]",
  "top rated": "bg-stone-100 text-stone-700 ring-1 ring-inset ring-stone-200",
  "limited stock":
    "bg-[#F7F0E8] text-[#805D36] ring-1 ring-inset ring-[#E8D7C0]",
  trending: "bg-stone-100 text-stone-800 ring-1 ring-inset ring-stone-200",
};

const getBadgeClass = (badge) => {
  if (!badge) return "";
  const key = (badge.text || badge.type || "").toLowerCase();
  return badgeStyles[key] || "bg-gray-800 text-white";
};

const ProductBadge = ({ badge, outOfStock }) => {
  if (outOfStock) {
    return (
      <span className="absolute left-2 top-2 z-[3] rounded bg-gray-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
        Out of Stock
      </span>
    );
  }

  if (!badge?.text) return null;

  return (
    <span
      className={`absolute left-2 top-2 z-[3] rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] ${getBadgeClass(badge)}`}
    >
      {badge.text}
    </span>
  );
};

export default ProductBadge;
