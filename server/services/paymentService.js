import SSLCommerzPayment from "sslcommerz-lts";
import Stripe from "stripe";
import { ApiError } from "../utils/ApiError.js";
import { generateOrderId } from "../utils/generateOrderId.js";
import { orderRepository } from "../repositories/order.repository.js";
import orderService from "./orderService.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const ssl = () =>
  new SSLCommerzPayment(
    process.env.SSL_STORE_ID,
    process.env.SSL_STORE_PASSWORD,
    process.env.SSL_IS_LIVE === "true",
  );

export const paymentService = {

  // ─── SSLCommerz ─────────────────────────────────────────────────────────────

  async initSSLPayment({ userId, addressId, user }) {
    const { items, subTotalAmt, totalAmt, delivery_address } =
      await orderService.buildOrderPayload({ userId, addressId });

    const orderId = generateOrderId();

    // Save pending order so IPN can locate and finalize it
    await orderRepository.create({
      userId,
      orderId,
      items,
      delivery_address,
      subTotalAmt,
      totalAmt,
      payment_status: "Pending",
      order_status:   "Processing",
    });

    const sslData = {
      total_amount:     totalAmt,
      currency:         "BDT",
      tran_id:          orderId,
      success_url:      `${process.env.SERVER_URL}/api/v1/payment/ssl/success`,
      fail_url:         `${process.env.SERVER_URL}/api/v1/payment/ssl/fail`,
      cancel_url:       `${process.env.SERVER_URL}/api/v1/payment/ssl/cancel`,
      ipn_url:          `${process.env.SERVER_URL}/api/v1/payment/ssl/ipn`,
      shipping_method:  "Courier",
      product_name:     items.map((i) => i.name).join(", ").slice(0, 100),
      product_category: "General",
      product_profile:  "general",
      cus_name:         user.name,
      cus_email:        user.email,
      cus_add1:         delivery_address.address_line,
      cus_city:         delivery_address.city,
      cus_state:        delivery_address.state,
      cus_postcode:     delivery_address.pincode,
      cus_country:      delivery_address.country,
      cus_phone:        delivery_address.mobile,
      ship_name:        user.name,
      ship_add1:        delivery_address.address_line,
      ship_city:        delivery_address.city,
      ship_state:       delivery_address.state,
      ship_postcode:    delivery_address.pincode,
      ship_country:     delivery_address.country,
    };

    const response = await ssl().init(sslData);

    if (!response?.GatewayPageURL) {
      // Mark pending order as failed so it doesn't linger
      const order = await orderRepository.findByOrderId(orderId);
      if (order) {
        order.payment_status = "Failed";
        await orderRepository.save(order);
      }
      throw new ApiError(500, "Failed to initialize payment gateway");
    }

    return { gatewayURL: response.GatewayPageURL, orderId };
  },

  /**
   * IPN — server-to-server callback from SSLCommerz.
   * Validates transaction then finalizes the pending order.
   * Idempotent — safe to call multiple times for the same order.
   */
  async handleSSLIPN({ tran_id, val_id, status }) {
    const order = await orderRepository.findByOrderId(tran_id);
    if (!order) throw new ApiError(404, "Order not found");

    // Already processed — return early, do nothing
    if (order.payment_status === "Paid") return order;

    if (status !== "VALID" && status !== "VALIDATED") {
      order.payment_status = "Failed";
      return orderRepository.save(order);
    }

    // Double-verify with SSLCommerz validation server
    const validation = await ssl().validate({ val_id });
    if (validation?.status !== "VALID" && validation?.status !== "VALIDATED") {
      order.payment_status = "Failed";
      return orderRepository.save(order);
    }

    // Finalize — decrement stock, clear cart
    await Promise.all(
      order.items.map((item) =>
        productRepository.decrementStock(item.productId, item.quantity),
      ),
    );

    order.payment_status = "Paid";
    order.paymentId      = val_id;
    order.order_status   = "Confirmed";

    return orderRepository.save(order);
  },

  // ─── Stripe ─────────────────────────────────────────────────────────────────

  /**
   * Creates a PaymentIntent and returns clientSecret to the frontend.
   * No order saved yet — webhook does that after payment succeeds.
   */
  async createStripeIntent({ userId, addressId }) {
    const { totalAmt, items } = await orderService.buildOrderPayload({
      userId,
      addressId,
    });

    const intent = await stripe.paymentIntents.create({
      amount:      Math.round(totalAmt * 100), // paisa
      currency:    "bdt",
      description: items.map((i) => i.name).join(", ").slice(0, 200),
      metadata: {
        userId:    userId.toString(),
        addressId: addressId.toString(),
      },
    });

    return { clientSecret: intent.client_secret };
  },

  /**
   * Stripe webhook — verifies signature then finalizes order.
   * Raw body must be passed in — do not parse before this point.
   */
  async handleStripeWebhook(rawBody, sig) {
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch {
      throw new ApiError(400, "Stripe webhook signature verification failed");
    }

    if (event.type === "payment_intent.succeeded") {
      const intent    = event.data.object;
      const userId    = intent.metadata.userId;
      const addressId = intent.metadata.addressId;

      await orderService.finalizeOnlineOrder({
        userId,
        addressId,
        paymentId:      intent.id,
        gatewayOrderId: generateOrderId(),
      });
    }

    return { received: true };
  },
};
