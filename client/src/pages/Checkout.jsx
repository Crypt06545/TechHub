import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingBag,
  Lock,
  MapPin,
  CreditCard,
  Truck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore"; // adjust path if needed
import { useAuth } from "@/hooks/useAuth";
import { AuthToast } from "@/components/common/AuthToast";
import BkashIcon from "@/assets/BKash-Icon2-Logo.wine.svg";
import NagadIcon from "@/assets/Nagad-Vertical-Logo.wine.svg";

const PAYMENT_METHODS = [
  {
    value: "COD",
    label: "Cash on delivery",
    desc: "Pay when your order arrives",
    icon: "💵",
    iconBg: "bg-gray-100",
  },
  {
    value: "bKash",
    label: "bKash",
    desc: "Send to 01XXXXXXXXX, then enter TXN ID",
    icon: BkashIcon,
    iconBg: "bg-white border border-gray-200",
  },
  {
    value: "Nagad",
    label: "Nagad",
    desc: "Send to 01XXXXXXXXX, then enter TXN ID",
    icon: NagadIcon,
    iconBg: "bg-white border border-gray-200",
  },
];

const FREE_SHIPPING_AT = 2000;
const LOCAL_SHIPPING_FEE = 60; // Bogura
const OUTSIDE_SHIPPING_FEE = 120; // elsewhere

const fmt = (n) => `৳${Math.round(n).toLocaleString("en-US")}`;

const CheckoutPage = () => {
  const navigate = useNavigate();

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: user?.name || "",
      mobile: user?.phone || "",
      country: "Bangladesh",
      city: "",
    },
  });

  const watchedCity = watch("city");

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  /* ── Guard: no browsing checkout with an empty cart ── */
  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [items.length, navigate]);

  if (items.length === 0) {
    return null; // redirect effect above handles navigation
  }

  /* ── Totals ── */
  const subTotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const isBogura = watchedCity?.trim().toLowerCase() === "bogura";
  const shippingCharge =
    subTotal >= FREE_SHIPPING_AT
      ? 0
      : isBogura
        ? LOCAL_SHIPPING_FEE
        : OUTSIDE_SHIPPING_FEE;
  const total = subTotal + shippingCharge;

  /* ── Submit ── */
  const onSubmit = (data) => {
    const payload = {
      fullName: data.fullName,
      mobile: data.mobile,
      address_line: data.address_line,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      country: data.country,
      payment_method: paymentMethod,
      ...(paymentMethod !== "COD" && { transactionId: data.transactionId }),
      items: items.map((item) => ({
        productId: item._id,
        name: item.name,
        image: item.image,
        slug: item.slug,
        quantity: item.quantity,
        price: item.price,
      })),
      subTotal,
      shippingCharge,
      total,
    };

    // TEMP: stub — replace this block with your real order mutation
    // (e.g. createOrder(payload, { onSuccess, onError })) once the
    // backend endpoint is ready. Logging here so you can inspect the
    // exact shape being sent.
    console.log("Order payload:", payload);

    setIsPlacingOrder(true);

    setTimeout(() => {
      setIsPlacingOrder(false);

      // Simulate a generated order id until the real API returns one
      const mockOrderId = `TH-${Date.now().toString().slice(-8)}`;

      clearCart();
      AuthToast.success("Order placed successfully");
      navigate(`/orders/${mockOrderId}`, {
        replace: true,
        state: { justPlaced: true },
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 bg-black rounded-sm flex items-center justify-center">
            <span className="text-white font-black text-xs">T</span>
          </div>
          <span className="font-bold text-lg tracking-tight">TechHub</span>
          <span className="text-gray-300 mx-2">/</span>
          <span className="text-sm text-muted-foreground">Checkout</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
            {/* Left — address + payment */}
            <div className="flex flex-col gap-5">
              {/* Address */}
              <Card className="border-gray-200 shadow-sm rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-6 h-6 rounded-full bg-black text-white text-xs font-semibold flex items-center justify-center">
                      1
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <h2 className="text-sm font-semibold">
                        Delivery address
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full name */}
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Full name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="Your name"
                        className={cn(
                          "h-11 border-gray-300 focus:border-black focus:ring-black",
                          errors.fullName && "border-red-400",
                        )}
                        {...register("fullName", {
                          required: "Full name is required",
                          minLength: {
                            value: 2,
                            message: "Name is too short",
                          },
                        })}
                      />
                      {errors.fullName && (
                        <p className="text-xs text-red-500">
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>

                    {/* Mobile */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Mobile number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="01XXXXXXXXX"
                        className={cn(
                          "h-11 border-gray-300 focus:border-black focus:ring-black",
                          errors.mobile && "border-red-400",
                        )}
                        {...register("mobile", {
                          required: "Mobile number is required",
                          pattern: {
                            value: /^01[3-9]\d{8}$/,
                            message: "Enter a valid BD mobile number",
                          },
                        })}
                      />
                      {errors.mobile && (
                        <p className="text-xs text-red-500">
                          {errors.mobile.message}
                        </p>
                      )}
                    </div>

                    {/* Country */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Country
                      </Label>
                      <Input
                        placeholder="Bangladesh"
                        className="h-11 border-gray-300 focus:border-black focus:ring-black"
                        {...register("country")}
                      />
                    </div>

                    {/* Address line — full width */}
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Address line <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="House no, road, area"
                        className={cn(
                          "h-11 border-gray-300 focus:border-black focus:ring-black",
                          errors.address_line && "border-red-400",
                        )}
                        {...register("address_line", {
                          required: "Address is required",
                          minLength: {
                            value: 5,
                            message: "Address too short",
                          },
                        })}
                      />
                      {errors.address_line && (
                        <p className="text-xs text-red-500">
                          {errors.address_line.message}
                        </p>
                      )}
                    </div>

                    {/* City */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="Bogura"
                        className={cn(
                          "h-11 border-gray-300 focus:border-black focus:ring-black",
                          errors.city && "border-red-400",
                        )}
                        {...register("city", {
                          required: "City is required",
                        })}
                      />
                      {errors.city && (
                        <p className="text-xs text-red-500">
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    {/* State */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        State <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="Rajshahi"
                        className={cn(
                          "h-11 border-gray-300 focus:border-black focus:ring-black",
                          errors.state && "border-red-400",
                        )}
                        {...register("state", {
                          required: "State is required",
                        })}
                      />
                      {errors.state && (
                        <p className="text-xs text-red-500">
                          {errors.state.message}
                        </p>
                      )}
                    </div>

                    {/* Pincode */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Pincode <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="5800"
                        className={cn(
                          "h-11 border-gray-300 focus:border-black focus:ring-black",
                          errors.pincode && "border-red-400",
                        )}
                        {...register("pincode", {
                          required: "Pincode is required",
                        })}
                      />
                      {errors.pincode && (
                        <p className="text-xs text-red-500">
                          {errors.pincode.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment */}
              <Card className="border-gray-200 shadow-sm rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-6 h-6 rounded-full bg-black text-white text-xs font-semibold flex items-center justify-center">
                      2
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <h2 className="text-sm font-semibold">Payment method</h2>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setPaymentMethod(method.value)}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-150",
                          paymentMethod === method.value
                            ? "border-black bg-gray-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                        )}
                      >
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                            paymentMethod === method.value
                              ? "border-black"
                              : "border-gray-300",
                          )}
                        >
                          {paymentMethod === method.value && (
                            <div className="w-2 h-2 rounded-full bg-black" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">
                            {method.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {method.desc}
                          </p>
                        </div>

                        <div
                          className={cn(
                            "w-16 h-16 rounded-lg flex items-center justify-center shrink-0 overflow-hidden",
                            method.iconBg,
                          )}
                        >
                          {method.value === "COD" ? (
                            <span className="text-2xl font-bold">
                              {method.icon}
                            </span>
                          ) : (
                            <img
                              src={method.icon}
                              alt={method.label}
                              className="w-full h-full object-contain p-1"
                            />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {paymentMethod !== "COD" && (
                    <div className="mt-4 flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Transaction ID <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="e.g. 8N7B3M2X1K"
                        className={cn(
                          "h-11 border-gray-300 focus:border-black focus:ring-black",
                          errors.transactionId && "border-red-400",
                        )}
                        {...register("transactionId", {
                          required:
                            paymentMethod !== "COD"
                              ? "Transaction ID is required"
                              : false,
                          minLength: {
                            value: 4,
                            message: "Invalid transaction ID",
                          },
                        })}
                      />
                      {errors.transactionId && (
                        <p className="text-xs text-red-500">
                          {errors.transactionId.message}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right — order summary */}
            <div className="lg:sticky lg:top-6">
              <Card className="border-gray-200 shadow-sm rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold">Order summary</h2>
                    <Link
                      to="/cart"
                      className="text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
                    >
                      Edit cart
                    </Link>
                  </div>

                  {/* Items */}
                  <div className="flex flex-col divide-y divide-gray-100 max-h-72 overflow-y-auto">
                    {items.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="relative w-11 h-11 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ShoppingBag className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gray-900 px-1 text-[9px] font-bold text-white">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold shrink-0">
                          {fmt(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Totals */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{fmt(subTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      {shippingCharge === 0 ? (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          Free
                        </span>
                      ) : (
                        <span>{fmt(shippingCharge)}</span>
                      )}
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base font-semibold">
                      <span>Total</span>
                      <span>{fmt(total)}</span>
                    </div>
                  </div>

                  {/* Place order button */}
                  <Button
                    type="submit"
                    disabled={isPlacingOrder}
                    className="w-full h-11 bg-black hover:bg-gray-900 text-white font-semibold rounded-xl mt-5 transition-all duration-200"
                  >
                    {isPlacingOrder ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Placing order...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Place order
                      </>
                    )}
                  </Button>

                  {/* Secure note */}
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Secured checkout
                    </p>
                  </div>

                  {/* Delivery note */}
                  <div className="flex items-start gap-2 mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Truck className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Free delivery on orders above ৳{FREE_SHIPPING_AT}. Bogura:
                      ৳{LOCAL_SHIPPING_FEE} — outside: ৳{OUTSIDE_SHIPPING_FEE}.
                    </p>
                  </div>

                  {/* COD reminder */}
                  {paymentMethod === "COD" && (
                    <div className="flex items-start gap-2 mt-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-orange-700 leading-relaxed">
                        Please keep the exact amount ready for the delivery
                        agent.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
