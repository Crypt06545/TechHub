import { useQuery } from "@tanstack/react-query";
import {
  getProducts,
  getProductFilters,
  getCategories,
  getProductSection,
  getProductDetails,
} from "@/api/product.api";

export const useProducts = (filters = {}, cursor = null) => {
  const params = {
    limit: 12,
    cursor: cursor || undefined,
    category: filters.categories?.length
      ? filters.categories.join(",")
      : undefined,
    brand: filters.brands?.length ? filters.brands.join(",") : undefined,
    minPrice: filters.priceTouched ? filters.priceRange?.[0] : undefined,
    maxPrice: filters.priceTouched ? filters.priceRange?.[1] : undefined,
    sort: filters.sort !== "newest" ? filters.sort : undefined,
    search: filters.search || undefined,
  };

  return useQuery({
    queryKey: ["products", filters, cursor],
    queryFn: () => getProducts(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useGetFilterFacets = () =>
  useQuery({
    queryKey: ["product-filters"],
    queryFn: getProductFilters,
    staleTime: 15 * 60 * 1000,
  });

export const useGetCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 15 * 60 * 1000,
  });

/**
 * ONE hook, every homepage section — Featured, Hot Deal, New Arrival,
 * Best Seller, Trending, etc. Calls the single /products/section/:type
 * endpoint. No branching here anymore -- the backend decides what
 * "featured" vs a badge means, this hook just passes the value through.
 */
export const useProductSection = (type) =>
  useQuery({
    queryKey: ["product-section", type],
    queryFn: () => getProductSection(type),
    staleTime: 5 * 60 * 1000,
    enabled: !!type,
  });

export const useProductDetails = (slug) =>
  useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductDetails(slug),
    enabled: !!slug,
  });
