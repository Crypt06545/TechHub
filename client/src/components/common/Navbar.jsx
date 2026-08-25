import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import UtilityBar from "./navbar/Utilitybar";
import NavBrand from "./navbar/Navbrand";
import SearchBar from "./navbar/SearchBar";
import NavActions from "./navbar/NavActions";
import MobileBottomNav from "./navbar/MobileBottomNav";

gsap.registerPlugin(useGSAP);

const Navbar = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const containerRef = useRef(null);

  return (
    <div
      ref={containerRef}
      className="w-full bg-gray-50 font-sans antialiased selection:bg-orange-500 selection:text-white"
    >
      <div className="hidden lg:block border-b border-gray-200">
        <UtilityBar />
      </div>

      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex h-17.5 lg:h-24 items-center justify-between gap-4">
            <NavBrand />
            <SearchBar
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
            <NavActions />
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default Navbar;
