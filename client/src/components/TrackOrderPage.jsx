import { useState } from "react";
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
  Phone,
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
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────
const STAGES = [
  { key: "Pending", label: "Order Placed", icon: Clock },
  { key: "Processing", label: "Processing", icon: PackageCheck },
  { key: "Shipped", label: "Shipped", icon: Truck },
  { key: "Delivered", label: "Delivered", icon: Home },
];

const STATUS_BADGE_STYLES = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Processing: "bg-blue-50 text-blue-700 border-blue-200",
  Shipped: "bg-gray-900 text-white border-gray-900",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-50 text-red-600 border-red-200",
};

// TODO: replace with the real backend call, e.g.
//   const res = await api.get("/orders/track", { params: { query } });
//   return res.data.data.order;
const mockFetchOrder = (query) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!query) {
        reject(new Error("Order ID or phone number is required."));
        return;
      }
      resolve({
        orderId: "ORD-2A9F31",
        order_status: "Shipped",
        placedAt: "2026-07-08T10:32:00Z",
        estimatedDelivery: "2026-07-14",
        phone: "01712345678",
        shippingAddress: {
          line1: "House 12, Road 4, Sherpur Road",
          city: "Bogura",
          area: "Bogura Sadar",
        },
        items: [
          {
            id: "1",
            title: "Lenovo ThinkPad E14 AMD Ryzen 5",
            qty: 1,
            price: 68000,
          },
          {
            id: "2",
            title: "Wireless Mechanical Keyboard",
            qty: 1,
            price: 3200,
          },
        ],
        shippingFee: 60,
      });
    }, 900);
  });

// ─────────────────────────────────────────────────────────────
// Status ribbon (signature element — real sequential data)
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
// Search form — split card, same DNA as LoginForm, single field
// ─────────────────────────────────────────────────────────────
const TrackOrderForm = ({ onSubmit, isSubmitting, submitError }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { query: "" } });

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
                <span className="text-white font-black text-xs">T</span>
              </div>
              <span className="font-bold text-lg tracking-tight">TechHub</span>
            </div>

            {/* Heading */}
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-extrabold tracking-tight">
                Track Your Order
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enter your order ID or phone number to see the latest status.
              </p>
            </div>

            {/* Single field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="query" className="text-sm font-semibold">
                Order ID or Phone Number
              </Label>
              <div className="relative">
                <PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="query"
                  placeholder="e.g. ORD-2A9F31 or 01712345678"
                  autoComplete="off"
                  className="pl-10 h-11 border-gray-300 focus:border-black focus:ring-black"
                  {...register("query", {
                    required: "Enter your order ID or phone number",
                    minLength: {
                      value: 4,
                      message: "Enter a valid order ID or phone number",
                    },
                  })}
                />
              </div>
              {errors.query && (
                <p className="text-xs text-red-500">{errors.query.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                You can use either the order ID from your confirmation, or the
                phone number used at checkout.
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
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const total = subtotal + order.shippingFee;

  return (
    <Card className="shadow-xl border border-gray-200 rounded-lg">
      <CardContent className="p-6 sm:p-10">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 bg-black rounded-sm flex items-center justify-center">
            <span className="text-white font-black text-xs">T</span>
          </div>
          <span className="font-bold text-lg tracking-tight">TechHub</span>
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
              {new Date(order.placedAt).toLocaleDateString("en-BD", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={`px-3 py-1 text-xs font-semibold ${STATUS_BADGE_STYLES[order.order_status]}`}
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

        {order.order_status !== "Cancelled" &&
          order.order_status !== "Delivered" && (
            <p className="text-xs text-muted-foreground mt-6 text-center sm:text-left">
              Estimated delivery:{" "}
              <span className="font-semibold text-gray-900">
                {new Date(order.estimatedDelivery).toLocaleDateString("en-BD", {
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </p>
          )}

        <Separator className="my-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold mb-4">Items</h3>
            <div className="flex flex-col gap-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="text-gray-700">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty {item.qty}
                    </p>
                  </div>
                  <p className="font-semibold whitespace-nowrap">
                    ৳{(item.price * item.qty).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>৳{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>৳{order.shippingFee.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-bold pt-1.5">
                <span>Total</span>
                <span>৳{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-4">Delivery Details</h3>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <p className="text-gray-700">
                  {order.shippingAddress.line1}, {order.shippingAddress.area},{" "}
                  {order.shippingAddress.city}
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <p className="text-gray-700">{order.phone}</p>
              </div>
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
  const [order, setOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleTrack = async ({ query }) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await mockFetchOrder(query);
      setOrder(result);
    } catch (err) {
      setSubmitError(
        err.message || "Order not found. Check your details and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setOrder(null);
    setSubmitError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        {!order ? (
          <TrackOrderForm
            onSubmit={handleTrack}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        ) : (
          <OrderResult order={order} onReset={handleReset} />
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
