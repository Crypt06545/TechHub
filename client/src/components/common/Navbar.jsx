import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import UtilityBar from "./navbar/Utilitybar";
import NavBrand from "./navbar/Navbrand";
import SearchBar from "./navbar/SearchBar";
import NavActions from "./navbar/NavActions";
import MobileDrawer from "./navbar/Mobiledrawer";

gsap.registerPlugin(useGSAP);

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const containerRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [mobileMenuOpen]);

  return (
    <div
      ref={containerRef}
      className="w-full bg-gray-50 border-b border-gray-200 font-sans antialiased selection:bg-orange-500 selection:text-white"
    >
      <UtilityBar />

      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between py-4 lg:py-5 gap-4">
          <NavBrand onMobileMenuOpen={() => setMobileMenuOpen(true)} />
          <SearchBar
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          <NavActions />
        </div>
      </div>

      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  );
};

export default Navbar;
