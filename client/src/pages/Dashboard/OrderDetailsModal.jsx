import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Phone,
  CreditCard,
  Package,
  Pencil,
  Plus,
  Minus,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import { AuthToast } from "@/components/common/AuthToast"; // adjust path if needed

/* TODO: replace this stub with your real mutation hook once the backend
   route exists, e.g.:
   import { useUpdateOrderItems } from "@/hooks/useAdminAnalytics";
   const { mutate: updateOrderItems, isPending: isSaving } = useUpdateOrderItems();

   Until then, this stub just logs the payload and resolves after a beat,
   so the Edit UI works end-to-end without crashing the app. */
const useUpdateOrderItemsStub = () => {
  const [isPending, setIsPending] = useState(false);
  const mutate = (payload, { onSuccess, onError } = {}) => {
    console.log("[OrderDetailsModal] would PATCH order with:", payload);
    setIsPending(true);
    setTimeout(() => {
      setIsPending(false);
      onSuccess?.();
    }, 400);
  };
  return { mutate, isPending };
};

const formatCurrency = (value) =>
  `৳${Number(value || 0).toLocaleString("en-BD")}`;

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const paymentStatusBadge = (status) => {
  const map = {
    Paid: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    Pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    Failed: "bg-red-100 text-red-700 hover:bg-red-100",
    Refunded: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  };
  return (
    <Badge
      className={map[status] || ""}
      variant={map[status] ? undefined : "secondary"}
    >
      {status || "—"}
    </Badge>
  );
};

const orderStatusBadge = (status) => {
  const map = {
    Processing: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    Confirmed: "bg-indigo-100 text-indigo-700 hover:bg-indigo-100",
    Shipped: "bg-purple-100 text-purple-700 hover:bg-purple-100",
    Delivered: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    Cancelled: "bg-red-100 text-red-700 hover:bg-red-100",
  };
  return (
    <Badge
      className={map[status] || ""}
      variant={map[status] ? undefined : "secondary"}
    >
      {status || "—"}
    </Badge>
  );
};

/* Normalizes line items regardless of whether your API returns
   order.items, order.products, or a populated productId object —
   adjust the field names here once to match your real schema.

   FIX: your API's line items carry their own `images` ARRAY
   (line.images[0]) rather than a singular `image` string, and
   variant info lives directly on the line item as `variantId` /
   `variantLabel` (e.g. "12ml", "Red / XL"). Both are now captured
   here so they don't silently disappear. */
const getLineItems = (order) => {
  const raw = order?.items || order?.products || [];
  return raw.map((line, idx) => {
    const product =
      line.productId && typeof line.productId === "object"
        ? line.productId
        : line.product || line;
    return {
      id: line._id || idx,
      name: line.name || product?.name || "—",
      image:
        line.image ||
        line.images?.[0] ||
        product?.image ||
        product?.images?.[0],
      price: line.price ?? product?.price ?? 0,
      quantity: line.quantity ?? 1,
      variantId: line.variantId || line.variant?._id || null,
      variantLabel:
        line.variantLabel || line.variant?.label || line.variant?.name || null,
    };
  });
};

/* ─────────────────────────────────────────────────────────────────────
   OrderDetailsModal
   Usage: <OrderDetailsModal order={viewOrder} onOpenChange={...} />
───────────────────────────────────────────────────────────────────── */
const OrderDetailsModal = ({ order, onOpenChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState([]);
  const [editedShipping, setEditedShipping] = useState(0);
  const [editedAddress, setEditedAddress] = useState({});

  const { mutate: updateOrderItems, isPending: isSaving } =
    useUpdateOrderItemsStub();

  if (!order) return null;

  const originalItems = getLineItems(order);
  const originalSubTotal = originalItems.reduce(
    (acc, i) => acc + i.price * i.quantity,
    0,
  );
  const originalShipping =
    order.shippingCharge ??
    Math.max(0, (order.totalAmt || 0) - originalSubTotal);

  const items = isEditing ? editedItems : originalItems;
  const shippingCharge = isEditing ? editedShipping : originalShipping;
  const subTotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const total = subTotal + shippingCharge;

  const address = isEditing ? editedAddress : order.delivery_address || {};

  const startEditing = () => {
    setEditedItems(originalItems.map((i) => ({ ...i })));
    setEditedShipping(originalShipping);
    setEditedAddress({ ...(order.delivery_address || {}) });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedItems([]);
    setEditedAddress({});
  };

  const changeAddressField = (field, value) => {
    setEditedAddress((prev) => ({ ...prev, [field]: value }));
  };

  const changeQty = (id, delta) => {
    setEditedItems((prev) =>
      prev
        .map((i) =>
          i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  const changePrice = (id, value) => {
    const price = Math.max(0, Number(value) || 0);
    setEditedItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, price } : i)),
    );
  };

  const removeItem = (id) => {
    setEditedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClose = (open) => {
    if (!open) setIsEditing(false);
    onOpenChange(open);
  };

  const handleSave = () => {
    if (editedItems.length === 0) {
      AuthToast.error("An order needs at least one item");
      return;
    }

    // Adjust payload shape to whatever your order-update endpoint expects.
    updateOrderItems(
      {
        orderId: order._id,
        items: editedItems.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
          price: i.price,
          variantId: i.variantId,
        })),
        shippingCharge: editedShipping,
        delivery_address: {
          fullName: editedAddress.fullName || "",
          mobile: editedAddress.mobile || "",
          address_line: editedAddress.address_line || "",
          city: editedAddress.city || "",
          state: editedAddress.state || "",
          pincode: editedAddress.pincode || "",
          country: editedAddress.country || "",
        },
      },
      {
        onSuccess: () => {
          AuthToast.success("Order updated");
          setIsEditing(false);
        },
        onError: (err) => {
          AuthToast.error(
            err?.response?.data?.message || "Couldn't update the order",
          );
        },
      },
    );
  };

  return (
    <Dialog open={Boolean(order)} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pr-8">
          <div className="flex items-center gap-2 flex-wrap">
            <DialogTitle>Order — {order.orderId}</DialogTitle>
            {orderStatusBadge(order.order_status)}
            {paymentStatusBadge(order.payment_status)}
          </div>
          <DialogDescription>
            Placed {formatDate(order.createdAt)}
          </DialogDescription>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={startEditing}
              className="gap-1.5 w-fit mt-1"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit order
            </Button>
          )}
        </DialogHeader>

        <div className="space-y-5">
          {/* Customer + shipping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                Customer
              </p>

              {!isEditing ? (
                <>
                  <p className="text-sm font-medium">
                    {order.userId?.name || address.fullName || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {address.mobile || order.userId?.phone || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.userId?.email || "—"}
                  </p>
                </>
              ) : (
                <div className="space-y-1.5">
                  <Input
                    value={address.fullName || ""}
                    onChange={(e) =>
                      changeAddressField("fullName", e.target.value)
                    }
                    placeholder="Full name"
                    className="h-8 text-xs"
                  />
                  <Input
                    value={address.mobile || ""}
                    onChange={(e) =>
                      changeAddressField("mobile", e.target.value)
                    }
                    placeholder="Mobile number"
                    className="h-8 text-xs"
                  />
                  <p className="text-xs text-muted-foreground pt-0.5">
                    {order.userId?.email || "—"}{" "}
                    <span className="text-[10px]">
                      (account email, not editable here)
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Shipping address
              </p>

              {!isEditing ? (
                <p className="text-sm leading-relaxed">
                  {[
                    address.address_line,
                    address.city,
                    address.state,
                    address.pincode,
                    address.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
              ) : (
                <div className="space-y-1.5">
                  <Input
                    value={address.address_line || ""}
                    onChange={(e) =>
                      changeAddressField("address_line", e.target.value)
                    }
                    placeholder="Address line"
                    className="h-8 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-1.5">
                    <Input
                      value={address.city || ""}
                      onChange={(e) =>
                        changeAddressField("city", e.target.value)
                      }
                      placeholder="City"
                      className="h-8 text-xs"
                    />
                    <Input
                      value={address.state || ""}
                      onChange={(e) =>
                        changeAddressField("state", e.target.value)
                      }
                      placeholder="State"
                      className="h-8 text-xs"
                    />
                    <Input
                      value={address.pincode || ""}
                      onChange={(e) =>
                        changeAddressField("pincode", e.target.value)
                      }
                      placeholder="Pincode"
                      className="h-8 text-xs"
                    />
                    <Input
                      value={address.country || ""}
                      onChange={(e) =>
                        changeAddressField("country", e.target.value)
                      }
                      placeholder="Country"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-xl border bg-muted/30 p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              Payment
            </p>
            <div className="flex items-center justify-between text-sm">
              <span>{order.payment_method || "COD"}</span>
              {order.transactionId && (
                <span className="text-xs text-muted-foreground">
                  TXN: {order.transactionId}
                </span>
              )}
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              Items ({items.length})
            </p>
            <div className="rounded-xl border divide-y">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-12 w-12 rounded-lg object-cover border bg-muted shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg border bg-muted shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                      {item.variantLabel && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4 font-normal shrink-0"
                        >
                          {item.variantLabel}
                        </Badge>
                      )}
                    </div>

                    {!isEditing ? (
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    ) : (
                      <div className="flex items-center gap-3 mt-1.5">
                        {/* Qty stepper */}
                        <div className="flex items-center overflow-hidden rounded-lg border">
                          <button
                            type="button"
                            onClick={() => changeQty(item.id, -1)}
                            className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="flex h-7 w-8 items-center justify-center border-x text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => changeQty(item.id, 1)}
                            className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Editable price */}
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">
                            ৳
                          </span>
                          <Input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(e) =>
                              changePrice(item.id, e.target.value)
                            }
                            className="h-7 w-24 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-sm font-semibold shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </p>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {items.length === 0 && (
                <p className="p-3 text-sm text-muted-foreground">
                  No item details available for this order.
                </p>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-xl border p-3 space-y-1.5">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(subTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Shipping</span>
              {!isEditing ? (
                <span>
                  {shippingCharge === 0
                    ? "Free"
                    : formatCurrency(shippingCharge)}
                </span>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-xs">৳</span>
                  <Input
                    type="number"
                    min="0"
                    value={editedShipping}
                    onChange={(e) =>
                      setEditedShipping(
                        Math.max(0, Number(e.target.value) || 0),
                      )
                    }
                    className="h-7 w-24 text-xs"
                  />
                </div>
              )}
            </div>
            <Separator className="my-1.5" />
            <div className="flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {isEditing && (
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={cancelEditing}
              disabled={isSaving}
              className="gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="gap-1.5"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
