// PATH: src/pages/admin/AdminInvoiceView.jsx
// FILE: AdminInvoiceView.jsx

import React, { useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas-pro"; // switched from html2canvas — supports oklch()/modern CSS colors used by shadcn+Tailwind v4, which was silently breaking PDF generation
import jsPDF from "jspdf";
import { Loader2, Download, Printer, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AuthToast } from "@/components/common/AuthToast"; // adjust path if needed

/* ── Static business info — edit once here, used on every invoice ── */
const BUSINESS = {
  name: "ZUHR",
  tagline: "Rooted in Sunnah | Trusted for purity.",
  address: "Bogura, Rajshahi, Bangladesh",
  email: "orders@zuhrbd.com",
  phone: "+880 XXXXXXXXXX",
};

// ⚠️ adjust to your actual customer-facing track-order route
const TRACK_ORDER_BASE_URL = "https://zuhrbd.com/track-order";

const formatCurrency = (value) =>
  `৳${Number(value || 0).toLocaleString("en-BD")}`;

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

// exact same badge color maps as AllOrders.jsx / OrderDetailsModal.jsx.
// dropped the `variant="secondary"` fallback — shadcn's secondary variant
// pulls its color from a CSS var that's often oklch()-based, which is
// exactly what broke html2canvas before. explicit gray class stays safe.
const paymentStatusBadge = (status) => {
  const map = {
    Paid: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    Pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    Failed: "bg-red-100 text-red-700 hover:bg-red-100",
    Refunded: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  };
  return (
    <Badge className={map[status] || "bg-gray-100 text-gray-700"}>
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
    <Badge className={map[status] || "bg-gray-100 text-gray-700"}>
      {status || "—"}
    </Badge>
  );
};

// same normalize logic as OrderDetailsModal.jsx — kept identical so item
// shape (image array vs string, variantLabel, populated productId) never
// silently drops fields between the two admin views
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
      variantLabel:
        line.variantLabel || line.variant?.label || line.variant?.name || null,
    };
  });
};

const AdminInvoiceView = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const invoiceRef = useRef(null);

  // no order in state — most likely a hard refresh/direct URL visit.
  // Since this pulls straight from the admin list's already-fetched data
  // (no separate fetch-by-id endpoint yet), send them back to the list.
  if (!order) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          No order data found — this page only opens from the Orders list.
        </p>
        <Link
          to="/admin/orders"
          className="text-xs font-medium text-primary hover:underline"
        >
          Go to Orders
        </Link>
      </div>
    );
  }

  const items = getLineItems(order);
  const subTotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shippingCharge =
    order.shippingCharge ?? Math.max(0, (order.totalAmt || 0) - subTotal);
  // ⚠️ adjust field names if your Order schema stores these differently
  const discount = order.discount || 0;
  const couponCode = order.couponCode || order.coupon?.code || null;
  const total = order.totalAmt ?? subTotal - discount + shippingCharge;
  const address = order.delivery_address || {};
  const trackUrl = `${TRACK_ORDER_BASE_URL}/${encodeURIComponent(order.orderId)}`;

  const handlePrint = () => window.print();

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;
    setGeneratingPdf(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`ZUHR-Invoice-${order.orderId}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      AuthToast.error("Couldn't generate the PDF. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Action bar — hidden on print/PDF */}
      <div className="mb-5 flex items-center justify-between print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={13} /> Back to orders
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-semibold hover:bg-muted"
          >
            <Printer size={14} /> Print
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={generatingPdf}
            className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {generatingPdf ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            {generatingPdf ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Invoice sheet — captured for PDF, shown as-is on print.
          `relative` anchors the absolutely-positioned watermark below.
          `min-h-[820px]` is the fix for the "watermark size differs
          between invoices" bug: the watermark is centered with
          top/left 50%, so its visible position depends on this card's
          *own* height. A short order (1–2 items) used to make the card
          short enough that `overflow-hidden` clipped the top/bottom of
          the logo, making it look smaller than on a long order. Giving
          the card a guaranteed minimum height means the full logo
          always has room to render, at the same size, every time —
          adjust this number if your invoices normally run taller. */}
      <div
        id="invoice-print-area"
        ref={invoiceRef}
        className="relative flex min-h-[820px] overflow-hidden rounded-2xl border bg-white p-8 sm:p-10 print:rounded-none print:border-0"
      >
        {/* Watermark — centered, straight (not diagonal), low opacity so
            it reads as a brand mark without ever competing with the text
            on top of it. pointer-events-none + select-none keep it purely
            decorative; z-0 puts it behind the z-10 content wrapper below.

            Sizing fix: was `w-[65%] max-w-[420px]` — a %-based width
            *should* be stable since the card's width doesn't change with
            content, but it's fragile (depends on viewport/zoom at the
            moment of capture). A fixed px width removes that variable
            entirely, so the logo is pixel-identical on every invoice
            regardless of item count or screen size. `max-w-[75%]` is
            just a safety net so it never overflows on a very narrow
            mobile view. */}
        <img
          src="/ZUHR_logo_transparent.svg"
          alt=""
          aria-hidden="true"
          style={{ opacity: 0.2 }}
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-95 max-w-[75%] -translate-x-1/2 -translate-y-1/2 select-none"
        />

        {/* Actual invoice content — sits above the watermark.
            `flex w-full flex-col` (+ the `flex-1` spacer just above the
            footer below) lets this stretch to the card's full height —
            needed so a short, 1-item order doesn't leave a dead empty
            gap between the footer and the bottom edge of the card; the
            spacer eats that leftover space instead, and collapses to
            nothing on longer invoices where there's no space to eat. */}
        <div className="relative z-10 flex w-full flex-col">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoice</h1>
              <div className="mt-4 space-y-1.5 text-xs text-gray-500">
                <p>
                  Invoice #{" "}
                  <span className="font-semibold text-gray-800">
                    {order.orderId}
                  </span>
                </p>
                <p>
                  Invoice Date{" "}
                  <span className="font-semibold text-gray-800">
                    {formatDate(order.createdAt)}
                  </span>
                </p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  {orderStatusBadge(order.order_status)}
                  {paymentStatusBadge(order.payment_status)}
                </div>
              </div>
            </div>

            {/* Same SVG file as the watermark, but rendered here at full
                opacity/size as the actual brand mark — `object-contain`
                keeps its real aspect ratio so it never looks stretched
                or squashed, `h-10` gives it a sensible header size, and
                `items-end` keeps it right-aligned above the tagline. */}
            <div className="flex flex-col items-end text-right">
              <img
                src="/ZUHR_logo_transparent.svg"
                alt={BUSINESS.name}
                className="h-16 w-auto object-contain"
              />
              <p className="mt-1.5 text-xs text-gray-400">{BUSINESS.tagline}</p>
            </div>
          </div>

          {/* Billed by / Billed to
              Backgrounds switched from solid `bg-gray-50` to `bg-gray-50/60`
              (60% opacity) — this is the fix for "watermark ke address
              section-er upore dekha jacche na". A fully opaque background
              was painting over the watermark sitting at z-0 underneath it;
              a translucent one lets the low-opacity logo show through,
              exactly like it already does over the plain white areas of
              the page, without needing any CSS blend-mode tricks (which
              html2canvas support for is unreliable — this stays 100%
              consistent between the live page, print, and the PDF export). */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50/60 p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Billed by
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {BUSINESS.name}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                {BUSINESS.address}
              </p>
              <p className="mt-2 text-xs text-gray-500">{BUSINESS.email}</p>
              <p className="text-xs text-gray-500">{BUSINESS.phone}</p>
            </div>

            <div className="rounded-xl bg-gray-50/60 p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Billed to
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {order.userId?.name || address.fullName || "—"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
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
              <p className="mt-2 text-xs text-gray-500">
                {address.mobile || order.userId?.phone || "—"}
              </p>
              {order.userId?.email && (
                <p className="text-xs text-gray-500">{order.userId.email}</p>
              )}
            </div>
          </div>

          {/* Items table */}
          <div className="mt-8 overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="w-10 px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Item description</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Unit Price</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      {item.variantLabel && (
                        <p className="text-[11px] text-gray-400">
                          {item.variantLabel}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-gray-400"
                    >
                      No item details available for this order.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Payment method */}
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <span>
              Payment method:{" "}
              <span className="font-medium text-gray-800">
                {order.payment_method || "COD"}
              </span>
            </span>
            {order.transactionId && (
              <span>
                TXN:{" "}
                <span className="font-medium text-gray-800">
                  {order.transactionId}
                </span>
              </span>
            )}
          </div>

          {/* QR (track order) + Summary */}
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="flex flex-col items-start">
              <p className="mb-3 text-sm font-semibold text-gray-900">
                Scan to track this order
              </p>
              <div className="flex w-fit flex-col items-center gap-2 rounded-xl border border-gray-100 p-4">
                <QRCodeSVG value={trackUrl} size={100} />
                <p className="max-w-[140px] text-center text-[11px] leading-relaxed text-gray-400">
                  Scan this code anytime to see live order status
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(subTotal)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount{couponCode ? ` (${couponCode})` : ""}</span>
                  <span className="font-medium text-red-500">
                    − {formatCurrency(discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-gray-900">
                  {shippingCharge === 0
                    ? "Free"
                    : formatCurrency(shippingCharge)}
                </span>
              </div>
              <div className="my-2 border-t border-gray-100" />
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Spacer — absorbs any leftover height so the footer sits at
              the bottom edge of the card instead of leaving blank space
              after it. On a long invoice this is 0px and changes nothing. */}
          <div className="flex-1" />

          {/* Footer */}
          <div className="mt-10 border-t border-gray-100 pt-5 text-[11px] text-gray-400">
            <p>Thank you for shopping with {BUSINESS.name}.</p>
            <p>
              For any enquiries, email {BUSINESS.email} or call {BUSINESS.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInvoiceView;
