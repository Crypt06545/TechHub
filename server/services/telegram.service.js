// services/telegramService.js
import axios from "axios";

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

export const sendTelegramMessage = async (text, options = {}) => {
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      ...options,
    });
  } catch (error) {
    // Telegram fail করলেও order flow যেন কখনো block না হয়
    console.error(
      "Telegram notification failed:",
      error?.response?.data || error.message,
    );
  }
};

const formatDate = (date) =>
  new Date(date).toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  });

// order.model.js এর enum গুলোর সাথে ঠিক ম্যাচ করানো
const ORDER_STATUS_EMOJI = {
  Processing: "🟡",
  Confirmed: "🔵",
  Shipped: "🚚",
  Delivered: "✅",
  Cancelled: "🔴",
};

const PAYMENT_STATUS_EMOJI = {
  Pending: "⏳",
  Paid: "✅",
  Failed: "❌",
  Refunded: "↩️",
};

export const formatOrderMessage = (order) => {
  const itemsList = order.items
    ?.map(
      (item, i) =>
        `   ${i + 1}. ${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ""}\n      Qty: ${item.quantity} × ৳${item.price} = ৳${item.quantity * item.price}`,
    )
    .join("\n");

  const addr = order.delivery_address;

  return `
🟢 <b>NEW ORDER — ZUHR</b>
━━━━━━━━━━━━━━━━━━

🆔 <b>Order ID:</b> ${order.orderId}
🕒 <b>Time:</b> ${formatDate(order.createdAt)}

👤 <b>Delivery Info</b>
   Phone: ${addr.mobile}
   Address: ${addr.address_line}, ${addr.city}, ${addr.state}
   Pincode: ${addr.pincode}

🧾 <b>Items (${order.items.length})</b>
${itemsList}

━━━━━━━━━━━━━━━━━━
${order.couponCode ? `🏷️ Coupon: <b>${order.couponCode}</b> (−৳${order.discountAmount})\n` : ""}📦 Subtotal: ৳${order.subTotalAmt}
🚚 Shipping: ৳${order.shippingCharge}
💳 Payment: <b>${order.payment_method}</b> ${PAYMENT_STATUS_EMOJI[order.payment_status]} ${order.payment_status}
💰 <b>Total: ৳${order.totalAmt}</b>
━━━━━━━━━━━━━━━━━━
📌 Status: ${ORDER_STATUS_EMOJI[order.order_status]} <b>${order.order_status}</b>
`;
};

export const buildOrderKeyboard = (mongoId) => ({
  inline_keyboard: [
    [
      {
        text: "🔗 View in Admin Panel",
        url: `https://zuhrbd.com/admin/orders/${mongoId}`,
      },
    ],
  ],
});
