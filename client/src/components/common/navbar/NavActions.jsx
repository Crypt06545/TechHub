import React from "react";
import { User, Heart, ShoppingCart, LayoutDashboard, Package, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../../../store/userStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NavActions = () => {
  const user      = useUserStore((s) => s.user);
  const clearUser = useUserStore((s) => s.clearUser);
  const isAdmin   = user?.role === "Admin";

  return (
    <div className="flex items-center gap-3 lg:gap-5">

      {/* Account */}
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hidden sm:flex items-center gap-2.5 text-left text-gray-700 hover:text-orange-600 transition-colors group outline-none">
              <div className="p-2 border border-gray-200 rounded-full bg-white group-hover:bg-orange-50 group-hover:border-orange-200 transition-colors">
                <User size={20} className="group-hover:text-orange-600" />
              </div>
              <div className="hidden lg:block text-xs">
                <p className="text-gray-400 font-normal leading-tight">Hello,</p>
                <span className="font-semibold text-gray-900 leading-tight group-hover:text-orange-600 transition-colors truncate max-w-[80px] block">
                  {user.name}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs text-gray-400 font-normal truncate">
              {user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                <User size={14} /> Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link to="/orders" className="flex items-center gap-2 cursor-pointer">
                <Package size={14} /> My Orders
              </Link>
            </DropdownMenuItem>

            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/admin/dashboard" className="flex items-center gap-2 cursor-pointer font-semibold text-orange-600">
                    <LayoutDashboard size={14} /> Admin Dashboard
                  </Link>
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={clearUser}
              className="flex items-center gap-2 text-red-500 cursor-pointer focus:text-red-500 focus:bg-red-50"
            >
              <LogOut size={14} /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link
          to="/login"
          className="hidden sm:flex items-center gap-2.5 text-left text-gray-700 hover:text-orange-600 transition-colors group"
        >
          <div className="p-2 border border-gray-200 rounded-full bg-white group-hover:bg-orange-50 group-hover:border-orange-200 transition-colors">
            <User size={20} className="group-hover:text-orange-600" />
          </div>
          <div className="hidden lg:block text-xs">
            <p className="text-gray-400 font-normal leading-tight">Account</p>
            <span className="font-semibold text-gray-900 leading-tight group-hover:text-orange-600 transition-colors">
              Sign In
            </span>
          </div>
        </Link>
      )}

      {/* Wishlist — untouched */}
      <button
        className="p-2 lg:p-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-full transition-all relative group"
        aria-label="Wishlist"
      >
        <Heart size={22} className="w-5 h-5 lg:w-6 lg:h-6" />
        <span className="absolute top-0.5 right-0.5 lg:top-1 lg:right-1 w-4 h-4 bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white box-content">
          2
        </span>
      </button>

      {/* Cart — untouched */}
      <button
        className="p-2 lg:p-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-full transition-all relative group"
        aria-label="Cart"
      >
        <ShoppingCart size={22} className="w-5 h-5 lg:w-6 lg:h-6" />
        <span className="absolute top-0.5 right-0.5 lg:top-1 lg:right-1 w-4 h-4 bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white box-content">
          3
        </span>
      </button>

    </div>
  );
};

export default NavActions;
