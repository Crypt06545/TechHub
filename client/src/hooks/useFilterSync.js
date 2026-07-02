import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useFilterStore } from "@/store/useFilterStore";

const parseFiltersFromParams = (params) => {
  const hasMinPrice = params.has("minPrice");
  const hasMaxPrice = params.has("maxPrice");
  return {
    categories: params.get("categories")?.split(",").filter(Boolean) || [],
    brands: params.get("brands")?.split(",").filter(Boolean) || [],
    priceRange: [
      Number(params.get("minPrice")) || 0,
      Number(params.get("maxPrice")) || 1000,
    ],
    priceTouched: hasMinPrice || hasMaxPrice,
    sort: params.get("sort") || "newest",
    search: params.get("search") || "",
  };
};

const filtersToParams = (filters) => {
  const params = new URLSearchParams();
  if (filters.categories.length)
    params.set("categories", filters.categories.join(","));
  if (filters.brands.length) params.set("brands", filters.brands.join(","));
  if (filters.priceTouched) {
    params.set("minPrice", filters.priceRange[0]);
    params.set("maxPrice", filters.priceRange[1]);
  }
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  if (filters.search) params.set("search", filters.search);
  return params;
};

export const useFilterSync = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useFilterStore((s) => s.filters);
  const setAllFilters = useFilterStore((s) => s.setAllFilters);
  const isFirstRun = useRef(true);

  useEffect(() => {
    setAllFilters(parseFiltersFromParams(searchParams));
  }, [searchParams.toString()]);

  // store -> URL
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setSearchParams(filtersToParams(filters), { replace: true });
  }, [filters]);

  return filters;
};
