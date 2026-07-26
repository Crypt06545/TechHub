import React from "react";
import { Truck, ShieldCheck, RefreshCw, Headset, Award, Tag, Gift } from "lucide-react";

const FEATURES = [
  { Icon: Truck, title: "Free Shipping", desc: "On orders over ৳2000" },
  { Icon: ShieldCheck, title: "Secure Payment", desc: "100% secure checkout" },
  { Icon: Gift, title: "Gift Certificates", desc: "৳1500 to ৳2500" },
  { Icon: Headset, title: "24/7 Support", desc: "Dedicated support" },
  { Icon: Award, title: "Trusted Store", desc: "100% verified seller" },
  { Icon: Tag, title: "Exclusive Offers", desc: "Save more every day" },
];

const StoreFeatures = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 py-8 lg:py-10 mt-2 border-t border-gray-100">
    {FEATURES.map(({ Icon, title, desc }, idx) => (
      <div key={idx} className="flex items-start gap-3 lg:gap-4">
        <Icon className="text-gray-400 mt-1 shrink-0" size={24} strokeWidth={1.5} />
        <div>
          <h4 className="text-[13px] lg:text-[14px] font-bold text-gray-900 leading-tight">{title}</h4>
          <p className="text-[11px] lg:text-[12px] text-gray-500 mt-0.5 lg:mt-1">{desc}</p>
        </div>
      </div>
    ))}
  </div>
);

export default StoreFeatures;
