import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, LayoutGrid } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CATEGORIES } from "./NavData";

const SearchBar = ({ selectedCategory, onCategoryChange }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const params = new URLSearchParams();
    params.set("search", trimmed);

    if (selectedCategory && selectedCategory !== "All Categories") {
      params.set("categories", selectedCategory);
    }

    navigate(`/products?${params.toString()}`);
    setQuery(""); // clear after search
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="hidden lg:flex flex-1 max-w-3xl items-center border border-gray-200 rounded-xl bg-[#F8F9FA] h-12 relative pl-2 mx-4">
      <DropdownMenu>
        <DropdownMenuTrigger className="h-full px-4 flex items-center gap-2 text-sm text-gray-700 font-medium hover:text-orange-600 transition-colors whitespace-nowrap outline-none">
          <LayoutGrid size={14} className="text-gray-500" />
          {selectedCategory}
          <ChevronDown size={14} className="text-gray-400" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-[100]"
        >
          {CATEGORIES.map((cat, idx) => (
            <DropdownMenuItem
              key={idx}
              onClick={() => onCategoryChange(cat)}
              className="px-4 py-2 text-sm text-gray-600 data-[focused]:bg-orange-50 data-[focused]:text-orange-600 rounded-lg cursor-pointer transition-colors outline-none"
            >
              {cat}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <span className="h-5 w-[1px] bg-gray-200 self-center" />

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search products, brands and categories..."
        className="w-full bg-transparent px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
      />

      <button
        onClick={handleSearch}
        className="h-10 bg-black hover:bg-orange-600 transition-colors px-6 text-white rounded-lg flex items-center gap-2 font-medium text-sm mr-1 shadow-sm"
      >
        <Search size={16} />
        <span>Search</span>
      </button>
    </div>
  );
};

export default SearchBar;
