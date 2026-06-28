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
    // 1. save address — if user already has a default, keep it
    //    if this is their first address, make it default
    const existingAddressCount = await Address.countDocuments({ userId });

    const savedAddress = await Address.create({
      userId,
      address_line: addressData.address_line,
      city: addressData.city,
      state: addressData.state,
      pincode: addressData.pincode,
      country: addressData.country || "Bangladesh",
      mobile: addressData.mobile,
      isDefault: existingAddressCount === 0, // first address = default
    });

    // 2. fetch cart
    const cartItems = await CartProductModel.find({ userId }).populate(
      "productId",
      "name images price stock",
    );
    if (!cartItems.length) throw new Error("CART_EMPTY");

    // 3. validate stock + build items
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

    // 4. snapshot address into order
    const delivery_address = {
      address_line: savedAddress.address_line,
      city: savedAddress.city,
      state: savedAddress.state,
      pincode: savedAddress.pincode,
      country: savedAddress.country,
      mobile: savedAddress.mobile,
    };

    // 5. create order
    const order = await orderRepository.createOrder({
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

    // 6. clear cart — fire and forget
    CartProductModel.deleteMany({ userId }).catch((err) =>
      console.error("Cart clear failed:", err),
    );

    return order;
  },

  // ─── User queries ──────────────────────────────────────────────────────────
  async getUserOrders(userId) {
    const orders = await orderRepository.findOrdersByUserId(userId);
    if (!orders.length) throw new Error("NO_ORDERS_FOUND");
    return orders;
  },

  async getSingleOrder({ orderId, userId }) {
    const order = await orderRepository.findOrderById(orderId, userId);
    if (!order) throw new Error("ORDER_NOT_FOUND");
    return order;
  },
  // ─── Admin ────────────────────────────────────────────────────────────────

  async adminGetAllOrders() {},
};

export default orderService;
