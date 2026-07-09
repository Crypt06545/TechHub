import React from "react";
import senzo from "@/assets/senzo.png"; // new transparent version

const NavBrand = () => (
  <div className="flex items-center flex-shrink-0">
    <div className="flex items-center cursor-pointer">
      <img
        src={senzo}
        alt="Senzo Brand Logo"
        className="h-20 sm:h-24 w-auto object-contain"
      />
    </div>
  </div>
);

export default NavBrand;
