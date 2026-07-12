import React from "react";
import { Link } from "react-router-dom";
import { Truck, RefreshCw, Headset, ChevronDown, Globe } from "lucide-react";

const UtilityBar = () => (
  <div className="w-full hidden lg:block bg-white border-b border-gray-100 text-[13px] text-gray-600 py-2">
    <div className="container mx-auto px-4 lg:px-6 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-1.5">
          <Truck size={14} /> Free Shipping on orders over $50
        </span>
        <span className="flex items-center gap-1.5">
          <RefreshCw size={14} /> 30-Day Money-Back Guarantee
        </span>
        <span className="flex items-center gap-1.5">
          <Headset size={14} /> 24/7 Expert Support
        </span>
      </div>
      <div className="flex items-center gap-6">
        <Link
          to="/track-order"
          className="cursor-pointer hover:text-orange-600 transition-colors font-medium"
        >
          Track Order
        </Link>
        <Link
          to="/help-center"
          className="cursor-pointer hover:text-orange-600 transition-colors font-medium"
        >
          Help Center
        </Link>
        <span className="cursor-pointer hover:text-orange-600 transition-colors flex items-center gap-1 font-medium">
          <Globe size={14} /> EN <ChevronDown size={12} />
        </span>
      </div>
    </div>
  </div>
);

export default UtilityBar;
