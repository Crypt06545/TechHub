import {
  getCategories,
  getFeaturedProducts,
  getProducsts,
  getProductDetails,
} from "@/api/product.api";
import { useQuery } from "@tanstack/react-query";

export const useProducts = (filters = {}) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducsts(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useGetCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 15 * 60 * 1000,
  });
};

//
export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ["featuredProducts"],
    queryFn: getFeaturedProducts,
    staleTime: 1000 * 60 * 5,
  });
};

export const useProductDetails = (slug) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductDetails(slug),
    enabled: !!slug,
  });
};
