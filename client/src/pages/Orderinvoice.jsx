import { useRef, useState } from "react";
import { Download, Printer, Loader2 } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────
   CONFIG — update to your real business details
───────────────────────────────────────────────────────────────────── */
const COMPANY = {
  name: "TechHub",
  address: "Bogura, Rajshahi Division, Bangladesh",
  email: "support@techhub.com",
  phone: "+880 1XXXXXXXXX",
};

const fmt = (n) => `৳${Math.round(Number(n) || 0).toLocaleString("en-US")}`;

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/* ─────────────────────────────────────────────────────────────────────
   OrderInvoice — pure presentational, no router dependency.
   Pass the placed order object as `order`. Works standalone on a
   route, or rendered inline (e.g. straight on the checkout page
   after a successful submit).
───────────────────────────────────────────────────────────────────── */
const OrderInvoice = ({ order }) => {
  const invoiceRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!order) return null;

  const items = order.items || [];
  const subTotal =
    order.subTotal ?? items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shippingCharge = order.shippingCharge ?? 0;
  const total = order.total ?? subTotal + shippingCharge;

  const invoiceNumber = order.orderId || order._id || "—";
  const invoiceDate = formatDate(order.createdAt || Date.now());

  const customerName = order.fullName || order.customerName || "Customer";
  const customerAddress = [
    order.address_line,
    order.city,
    order.state,
    order.pincode,
    order.country,
  ]
    .filter(Boolean)
    .join(", ");

  const handlePrint = () => window.print();

  /* Client-side PDF export — requires: npm install jspdf html2canvas */
  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF } = await import("jspdf");

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = (canvas.height * pageWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      pdf.save(`invoice-${invoiceNumber}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Couldn't generate PDF. Falling back to print dialog.");
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="print:bg-white">
      {/* Action bar — hidden when printing */}
      <div className="max-w-3xl mx-auto mb-4 flex items-center justify-end gap-2 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          Print
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-black text-white text-xs font-semibold hover:bg-gray-900 transition-colors disabled:opacity-60"
        >
          {downloading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          {downloading ? "Generating..." : "Download PDF"}
        </button>
      </div>

      {/* Invoice sheet */}
      <div
        ref={invoiceRef}
        className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-10 print:border-0 print:shadow-none print:rounded-none print:p-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-black rounded-md flex items-center justify-center">
              <span className="text-white font-black text-sm">T</span>
            </div>
            <div>
              <p className="font-bold text-lg leading-tight tracking-tight">
                {COMPANY.name}
              </p>
              <p className="text-[11px] text-gray-400">{COMPANY.address}</p>
            </div>
          </div>

          <div className="text-right">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Invoice
            </h1>
            <div className="mt-2 text-xs text-gray-500 space-y-0.5">
              <p>
                Invoice #{" "}
                <span className="font-semibold text-gray-900">
                  {invoiceNumber}
                </span>
              </p>
              <p>
                Date{" "}
                <span className="font-semibold text-gray-900">
                  {invoiceDate}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Billed to + payment */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Billed to
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {customerName}
            </p>
            {customerAddress && (
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {customerAddress}
              </p>
            )}
            {order.mobile && (
              <p className="text-xs text-gray-500 mt-1">{order.mobile}</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Payment details
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {order.payment_method || "COD"}
            </p>
            {order.transactionId && (
              <p className="text-xs text-gray-500 mt-1">
                TXN ID: {order.transactionId}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Status: {order.status || "Confirmed"}
            </p>
          </div>
        </div>

        {/* Items table */}
        <table className="w-full text-sm mb-8 border-collapse">
          <thead>
            <tr className="bg-black text-white text-xs uppercase tracking-wide">
              <th className="text-left font-semibold py-2.5 px-3 rounded-l-lg">
                #
              </th>
              <th className="text-left font-semibold py-2.5 px-3">Item</th>
              <th className="text-center font-semibold py-2.5 px-3">Qty</th>
              <th className="text-right font-semibold py-2.5 px-3">Price</th>
              <th className="text-right font-semibold py-2.5 px-3 rounded-r-lg">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <tr key={item._id || idx}>
                <td className="py-3 px-3 text-gray-500">{idx + 1}</td>
                <td className="py-3 px-3 font-medium text-gray-900">
                  {item.name}
                </td>
                <td className="py-3 px-3 text-center text-gray-600">
                  {item.quantity}
                </td>
                <td className="py-3 px-3 text-right text-gray-600">
                  {fmt(item.price)}
                </td>
                <td className="py-3 px-3 text-right font-semibold text-gray-900">
                  {fmt(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-10">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Sub total</span>
              <span>{fmt(subTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span>{shippingCharge === 0 ? "Free" : fmt(shippingCharge)}</span>
            </div>
            <div className="h-px bg-gray-200 my-2" />
            <div className="flex justify-between text-base font-bold text-gray-900">
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="border-t border-gray-100 pt-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1">
              Terms & conditions
            </p>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Goods once sold under COD are exchangeable within 7 days if unused
              and in original packaging. For prepaid orders, refunds are
              processed within 5–7 business days.
            </p>
          </div>

          <div className="text-center text-[11px] text-gray-400 pt-4">
            Questions about this invoice? Email {COMPANY.email} or call{" "}
            {COMPANY.phone}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInvoice;
