import { orderRepository } from "../repositories/order.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { generateOrderId } from "../utils/generateOrderId.js";
import { ApiError } from "../utils/ApiError.js";
import { cartRepository } from "../repositories/cartRepository.js";
import { addressRepository } from "../repositories/addressRepository.js";
import Address from "../models/address.model.js";
import CartProductModel from "../models/cartProduct.model.js";

const orderService = {
  // ─── COD ──────────────────────────────────────────────────────────────────
  async placeCodOrder({ userId, addressData }) {
    const existingAddressCount = await Address.countDocuments({ userId });

    const savedAddress = await Address.create({
      userId,
      address_line: addressData.address_line,
      city: addressData.city,
      state: addressData.state,
      pincode: addressData.pincode,
      country: addressData.country || "Bangladesh",
      mobile: addressData.mobile,
      isDefault: existingAddressCount === 0,
    });

    const cartItems = await CartProductModel.find({ userId }).populate(
      "productId",
      "name images price stock",
    );
    if (!cartItems.length) throw new Error("CART_EMPTY");

    let subTotalAmt = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = item.productId;
      if (!product) throw new Error("PRODUCT_NOT_FOUND");
      if (product.stock < item.quantity) {
        throw new Error(`INSUFFICIENT_STOCK:${product.name}`);
      }

      subTotalAmt += product.price * item.quantity;

      orderItems.push({
        productId: product._id,
        name: product.name,
        images: product.images,
        price: product.price,
        quantity: item.quantity,
      });
    }

    const delivery_address = {
      address_line: savedAddress.address_line,
      city: savedAddress.city,
      state: savedAddress.state,
      pincode: savedAddress.pincode,
      country: savedAddress.country,
      mobile: savedAddress.mobile,
    };

    const order = await orderRepository.create({
      userId,
      orderId: generateOrderId(),
      items: orderItems,
      delivery_address,
      payment_method: "COD",
      payment_status: "Pending",
      order_status: "Processing",
      subTotalAmt,
      totalAmt: subTotalAmt,
    });

    CartProductModel.deleteMany({ userId }).catch((err) =>
      console.error("Cart clear failed:", err),
    );

    return order;
  },

  // ─── User queries ──────────────────────────────────────────────────────────
  async getUserOrders(userId) {
    const orders = await orderRepository.findByUserId(userId);
    if (!orders.length) throw new Error("NO_ORDERS_FOUND");
    return orders;
  },

  async getSingleOrder({ orderId, userId }) {
    const order = await orderRepository.findByIdAndUserId({ orderId, userId });
    if (!order) throw new Error("ORDER_NOT_FOUND");
    return order;
  },

  // ─── Admin ────────────────────────────────────────────────────────────────

  async adminGetAllOrders({
    payment_status,
    order_status,
    search,
    sortDirection,
    cursor,
    limit,
  }) {
    return orderRepository.findAllOrdersAdmin({
      payment_status,
      order_status,
      search,
      sortDirection,
      cursor,
      limit,
    });
  },

  async adminUpdateOrderStatus({ orderId, order_status, payment_status }) {
    if (!order_status && !payment_status) {
      throw new ApiError(
        400,
        "At least one of order_status or payment_status is required",
      );
    }

    const order = await orderRepository.updateStatusById(orderId, {
      order_status,
      payment_status,
    });

    if (!order) throw new ApiError(404, "Order not found");

    return order;
  },
};

export default orderService;
