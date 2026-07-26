import React from "react";
import { Link } from "react-router-dom";
import ZUHR from "@/assets/logo.png";

const NavBrand = () => (
  <div className="flex items-center shrink-0 h-full">
    <Link to="/" className="flex items-center h-full cursor-pointer">
      <img
        src={ZUHR}
        alt="ZUHR Brand Logo"
        className="h-20 lg:h-24 w-auto object-contain"
      />
    </Link>
  </div>
);

export default NavBrand;
