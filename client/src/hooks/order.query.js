import { getSingleOrder, getUserOrders, placeOrder } from "@/api/order.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: placeOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
    },
  });
};

export const useUserOrders = (enabled = true) => {
  return useQuery({
    queryKey: ["userOrders"],
    queryFn: getUserOrders,
    enabled,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useSingleOrder = (id, enabled = true) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => getSingleOrder(id),
    enabled: enabled && !!id,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
