import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Hash,
  PackageSearch,
  Truck,
  Clock,
  PackageCheck,
  Home,
  XCircle,
  MapPin,
  RotateCcw,
  CircleAlert,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useTrackOrder } from "@/hooks/order.query";

// ─────────────────────────────────────────────────────────────
// Config — mirrors the real order_status enum used in
// AllOrders.jsx / OrderDetailsModal.jsx (Processing, Confirmed,
// Shipped, Delivered, Cancelled)
// ─────────────────────────────────────────────────────────────
const STAGES = [
  { key: "Processing", label: "Processing", icon: Clock },
  { key: "Confirmed", label: "Confirmed", icon: PackageCheck },
  { key: "Shipped", label: "Shipped", icon: Truck },
  { key: "Delivered", label: "Delivered", icon: Home },
];

const STATUS_BADGE_STYLES = {
  Processing: "bg-blue-50 text-blue-700 border-blue-200",
  Confirmed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Shipped: "bg-gray-900 text-white border-gray-900",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-50 text-red-600 border-red-200",
};

// ─────────────────────────────────────────────────────────────
// Status ribbon
// ─────────────────────────────────────────────────────────────
const StatusRibbon = ({ currentStatus }) => {
  if (currentStatus === "Cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3">
        <XCircle className="h-5 w-5 text-red-600 shrink-0" />
        <p className="text-sm font-semibold text-red-600">
          This order was cancelled.
        </p>
      </div>
    );
  }

  const currentIndex = STAGES.findIndex((s) => s.key === currentStatus);

  return (
    <div className="w-full">
      <div className="hidden sm:flex items-center">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const isDone = i <= currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div
              key={stage.key}
              className="flex items-center flex-1 last:flex-none"
            >
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isDone
                      ? "bg-gray-900 border-gray-900 text-white"
                      : "bg-white border-gray-200 text-gray-300"
                  } ${isCurrent ? "ring-4 ring-gray-100" : ""}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={`text-xs font-semibold whitespace-nowrap ${
                    isDone ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 mb-5 transition-colors ${
                    i < currentIndex ? "bg-gray-900" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex sm:hidden flex-col gap-0">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const isDone = i <= currentIndex;
          const isCurrent = i === currentIndex;
          const isLast = i === STAGES.length - 1;

          return (
            <div key={stage.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 shrink-0 transition-colors ${
                    isDone
                      ? "bg-gray-900 border-gray-900 text-white"
                      : "bg-white border-gray-200 text-gray-300"
                  } ${isCurrent ? "ring-4 ring-gray-100" : ""}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 min-h-[28px] transition-colors ${
                      i < currentIndex ? "bg-gray-900" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
              <div className="pb-7">
                <p
                  className={`text-sm font-semibold ${isDone ? "text-gray-900" : "text-gray-400"}`}
                >
                  {stage.label}
                </p>
                {isCurrent && (
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">
                    Current status
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Search form — Order ID only
// ─────────────────────────────────────────────────────────────
const TrackOrderForm = ({ onSubmit, isSubmitting, submitError }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { orderId: "" } });

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="overflow-hidden p-0 shadow-xl border border-gray-200">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Form side */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-8 md:p-10 flex flex-col gap-6"
          >
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-black rounded-sm flex items-center justify-center">
                <span className="text-white font-black text-xs">Z</span>
              </div>
              <span className="font-bold text-lg tracking-tight">ZUHR</span>
            </div>

            {/* Heading */}
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-extrabold tracking-tight">
                Track Your Order
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enter your Order ID to see the latest status.
              </p>
            </div>

            {/* Order ID field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="orderId" className="text-sm font-semibold">
                Order ID
              </Label>
              <div className="relative">
                <PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="orderId"
                  placeholder="e.g. SEED-ZW61362H-8W3U"
                  autoComplete="off"
                  className="pl-10 h-11 border-gray-300 focus:border-black focus:ring-black"
                  {...register("orderId", {
                    required: "Enter your Order ID",
                    minLength: {
                      value: 4,
                      message: "Enter a valid Order ID",
                    },
                  })}
                />
              </div>
              {errors.orderId && (
                <p className="text-xs text-red-500">{errors.orderId.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                You'll find your Order ID in your confirmation email or invoice.
              </p>
            </div>

            {submitError && (
              <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2">
                <CircleAlert className="h-4 w-4 text-red-600 shrink-0" />
                <p className="text-xs text-red-600">{submitError}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 bg-black hover:bg-gray-900 text-white font-semibold text-base rounded-md transition-all duration-200 hover:shadow-lg gap-2"
            >
              <PackageSearch className="w-4 h-4" />
              {isSubmitting ? "Searching..." : "Track Order"}
            </Button>

            <Separator />

            <p className="text-center text-sm text-muted-foreground">
              Can&apos;t find your order?{" "}
              <span className="font-semibold text-red-500 hover:underline underline-offset-4 cursor-pointer">
                Contact support
              </span>
            </p>
          </form>

          {/* Illustration side */}
          <div className="relative hidden md:flex flex-col bg-gray-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)]" />
            <div className="flex-1 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 blur-2xl bg-white/10 rounded-full" />
                <Truck
                  className="relative w-28 h-28 text-white/90"
                  strokeWidth={1.2}
                />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 flex items-start gap-3 text-white">
              <ShieldCheck className="w-5 h-5 mt-0.5 text-white/80 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Real-Time Tracking</p>
                <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
                  Know exactly where your order is, every step of the way.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Order result
// ─────────────────────────────────────────────────────────────
const OrderResult = ({ order, onReset }) => {
  return (
    <Card className="shadow-xl border border-gray-200 rounded-lg">
      <CardContent className="p-6 sm:p-10">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 bg-black rounded-sm flex items-center justify-center">
            <span className="text-white font-black text-xs">Z</span>
          </div>
          <span className="font-bold text-lg tracking-tight">ZUHR</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Hash className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-muted-foreground">Order</span>
              <span className="text-sm font-bold">{order.orderId}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-BD", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={`px-3 py-1 text-xs font-semibold ${STATUS_BADGE_STYLES[order.order_status] || ""}`}
            >
              {order.order_status}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="border-gray-300 hover:border-gray-400 font-medium gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Track another
            </Button>
          </div>
        </div>

        <StatusRibbon currentStatus={order.order_status} />

        <Separator className="my-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold mb-4">Items</h3>
            <div className="flex flex-col gap-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div>
                    <p className="text-gray-700">
                      {item.name}
                      {item.variantLabel && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({item.variantLabel})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold whitespace-nowrap">
                    ৳{(item.price * item.quantity).toLocaleString("en-BD")}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>৳{order.subTotalAmt.toLocaleString("en-BD")}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount</span>
                  <span>− ৳{order.discountAmount.toLocaleString("en-BD")}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>
                  {order.shippingCharge === 0
                    ? "Free"
                    : `৳${order.shippingCharge.toLocaleString("en-BD")}`}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-1.5">
                <span>Total</span>
                <span>৳{order.totalAmt.toLocaleString("en-BD")}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-4">Delivery Details</h3>
            <div className="flex items-start gap-2.5 text-sm">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <p className="text-gray-700">
                {[order.shippingAddress.area, order.shippingAddress.city]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
const TrackOrderPage = () => {
  const { orderId: orderIdFromUrl } = useParams();

  // The id we're actively tracking — set either by the form submit or,
  // for a QR scan, by the URL param on mount (see the effect below).
  const [trackingId, setTrackingId] = useState(orderIdFromUrl || null);

  const { data, isLoading, isError, error } = useTrackOrder(
    trackingId,
    Boolean(trackingId),
  );

  const order = data?.data?.order;

  // QR scans land on /track-order/:orderId — start tracking immediately
  // instead of making the person retype it into the form.
  useEffect(() => {
    const trimmed = orderIdFromUrl?.trim();
    if (trimmed) setTrackingId(trimmed);
  }, [orderIdFromUrl]);

  const handleFormSubmit = ({ orderId }) => {
    const trimmed = orderId?.trim();
    if (trimmed) setTrackingId(trimmed);
  };

  const handleReset = () => setTrackingId(null);

  const showResult = Boolean(order) && !isError;
  const submitError = isError
    ? error?.response?.data?.message ||
      "Order not found. Check your Order ID and try again."
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <p className="text-sm text-muted-foreground">
              Looking up your order...
            </p>
          </div>
        ) : showResult ? (
          <OrderResult order={order} onReset={handleReset} />
        ) : (
          <TrackOrderForm
            onSubmit={handleFormSubmit}
            isSubmitting={isLoading}
            submitError={submitError}
          />
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
