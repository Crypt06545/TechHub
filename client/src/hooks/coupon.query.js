import { checkCoupon } from "@/api/coupon.api";
import { useMutation } from "@tanstack/react-query";

export const useCheckCoupon = () => {
  return useMutation({
    mutationFn: checkCoupon,
  });
};
