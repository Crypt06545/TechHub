import React from "react";
import { Menu } from "lucide-react";
import senzo from '@/assets/senzo.png';

const NavBrand = ({ onMobileMenuOpen }) => (
  <div className="flex items-center gap-3 lg:gap-4">
    <button
      className="lg:hidden p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      onClick={onMobileMenuOpen}
      aria-label="Open menu"
    >
      <Menu size={24} />
    </button>

    <div className="flex items-center cursor-pointer flex-shrink-0">
      <img
        src={senzo}
        alt="Senzo Brand Logo"
        className="h-20 sm:h-24 w-auto object-contain mix-blend-multiply"
      />
    </div>
  </div>
);

export default NavBrand;
