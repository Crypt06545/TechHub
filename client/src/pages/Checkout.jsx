import { useState } from "react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Lock, MapPin, CreditCard, Truck } from "lucide-react";

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
    icon: "bK",
    iconBg: "bg-pink-50 text-pink-700",
  },
  {
    value: "Nagad",
    label: "Nagad",
    desc: "Send to 01XXXXXXXXX, then enter TXN ID",
    icon: "Ng",
    iconBg: "bg-orange-50 text-orange-700",
  },
];

const CheckoutPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { country: "Bangladesh" },
  });

  // mock cart — replace with your cart state/query
  const cartItems = [
    {
      _id: "1",
      name: "GoPro HERO12 Black Action Camera",
      quantity: 4,
      price: 42000,
    },
  ];

  const subTotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shippingCharge = subTotal >= 1000 ? 0 : 60;
  const total = subTotal + shippingCharge;

  const fmt = (n) =>
    new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(n);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const payload = {
      address_line: data.address_line,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      country: data.country,
      mobile: data.mobile,
      payment_method: paymentMethod,
      ...(paymentMethod !== "COD" && { transactionId: data.transactionId }),
    };
    console.log(payload);
    // await placeOrder(payload)
    setIsLoading(false);
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
                          minLength: { value: 5, message: "Address too short" },
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
                        {...register("city", { required: "City is required" })}
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
                        {/* Radio dot */}
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
                            "w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                            method.iconBg,
                          )}
                        >
                          {method.icon}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* TXN ID field — bKash / Nagad */}
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
                  <h2 className="text-sm font-semibold mb-4">Order summary</h2>

                  {/* Items */}
                  <div className="flex flex-col divide-y divide-gray-100">
                    {cartItems.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="w-11 h-11 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-4 h-4 text-gray-400" />
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
                    disabled={isLoading}
                    className="w-full h-11 bg-black hover:bg-gray-900 text-white font-semibold rounded-xl mt-5 transition-all duration-200"
                  >
                    {isLoading ? (
                      "Placing order..."
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
                      Free delivery on orders above ৳1,000. Bogura: ৳60 —
                      outside: ৳120.
                    </p>
                  </div>
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
