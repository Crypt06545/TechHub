import React from "react";
import { useForm, Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateOrderStatus } from "@/hooks/useAdminAnalytics";

const orderStatusOptions = [
  "Processing",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const paymentStatusOptions = ["Pending", "Paid", "Failed", "Refunded"];

const UpdateOrderStatus = ({ order, onSuccess }) => {
  const updateMutation = useUpdateOrderStatus();

  const { control, register, handleSubmit } = useForm({
    defaultValues: {
      order_status: order?.order_status || "Processing",
      payment_status: order?.payment_status || "Pending",
      courierCost: order?.costs?.courierCost || 0,
    },
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        courierCost: Number(data.courierCost) || 0,
      };

      await updateMutation.mutateAsync({ id: order._id, payload });
      onSuccess?.();
    } catch (err) {
      console.error("Update order status failed:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label>Order status</Label>
        <Controller
          name="order_status"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {orderStatusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Payment status</Label>
        <Controller
          name="payment_status"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentStatusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Courier Cost (৳)</Label>
        <Input
          type="number"
          min="0"
          placeholder="e.g. 60"
          {...register("courierCost")}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Updating..." : "Update Status"}
        </Button>
      </div>
    </form>
  );
};

export default UpdateOrderStatus;
