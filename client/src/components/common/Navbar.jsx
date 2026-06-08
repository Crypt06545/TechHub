import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import UtilityBar from "./navbar/Utilitybar";
import NavBrand from "./navbar/Navbrand";
import SearchBar from "./navbar/SearchBar";
import NavActions from "./navbar/NavActions";
import NavLinks from "./navbar/NavLinks";
import MobileDrawer from "./navbar/Mobiledrawer";

gsap.registerPlugin(useGSAP);

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const containerRef = useRef(null);
  const { contextSafe } = useGSAP({ scope: containerRef });

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // GSAP nav-link roll-up handlers — must stay here (contextSafe scope is on containerRef)
  const handleMouseEnter = contextSafe((e) => {
    const primary = e.currentTarget.querySelector(".nav-primary");
    const secondary = e.currentTarget.querySelector(".nav-secondary");
    if (!primary || !secondary) return;
    gsap.killTweensOf([primary, secondary]);
    gsap.to(primary, { y: "-100%", duration: 0.2, ease: "power1.out" });
    gsap.to(secondary, { y: "-100%", duration: 0.2, ease: "power1.out" });
  });

  const handleMouseLeave = contextSafe((e) => {
    const primary = e.currentTarget.querySelector(".nav-primary");
    const secondary = e.currentTarget.querySelector(".nav-secondary");
    if (!primary || !secondary) return;
    gsap.killTweensOf([primary, secondary]);
    gsap.to(primary, { y: "0%", duration: 0.2, ease: "power1.out" });
    gsap.to(secondary, { y: "0%", duration: 0.2, ease: "power1.out" });
  });

  return (
    <div
      ref={containerRef}
      className="w-full bg-white border-b border-gray-100 font-sans antialiased selection:bg-orange-500 selection:text-white relative"
    >
      {/* Top utility bar (desktop only) */}
      <UtilityBar />

      <div className="container mx-auto px-4 lg:px-6">
        {/* Row 1 — Logo / Search / Actions */}
        <div className="flex items-center justify-between py-4 lg:py-5 gap-4">
          <NavBrand onMobileMenuOpen={() => setMobileMenuOpen(true)} />
          <SearchBar
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          <NavActions />
        </div>

        {/* Row 2 — Animated nav links (desktop) */}
        <NavLinks
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      {/* Mobile slide-over drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  );
};

export default Navbar;
