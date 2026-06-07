
import { orderRepository } from "../repositories/order.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { cartRepository } from "../repositories/cart.repository.js";
import { addressRepository } from "../repositories/address.repository.js";
import { generateOrderId } from "../utils/generateOrderId.js";
import { ApiError } from "../utils/ApiError.js";

const orderService = {
  /**
   * Cart validate করো, stock check করো, order payload বানাও।
   * কিছুই database-এ save করে না — শুধু data prepare করে।
   */
  async buildOrderPayload({ userId, addressId }) {
    // ১. ঠিকানা আছে কিনা দেখো
    const address = await addressRepository.findByIdAndUserId({ addressId, userId });
    if (!address) throw new ApiError(404, "Address not found");

    // ২. Cart-এ কিছু আছে কিনা দেখো
    const cartItems = await cartRepository.findByUserId(userId);
    if (!cartItems.length) throw new ApiError(400, "Cart is empty");

    // ৩. সব product একসাথে আনো (N+1 query এড়াতে)
    const productIds = cartItems.map((c) => c.productId);
    const products = await productRepository.findByIds(productIds);

    // ৪. দ্রুত lookup-এর জন্য map বানাও
    const productMap = Object.fromEntries(
      products.map((p) => [p._id.toString(), p]),
    );

    // ৫. প্রতিটা cart item validate করো
    const items = [];
    for (const cartItem of cartItems) {
      const product = productMap[cartItem.productId.toString()];

      if (!product) {
        throw new ApiError(404, `Product not found`);
      }
      if (!product.isPublished || product.isArchived) {
        throw new ApiError(400, `"${product.title}" আর পাওয়া যাচ্ছে না`);
      }
      if (product.stock < cartItem.quantity) {
        throw new ApiError(400, `"${product.title}"-এর স্টক যথেষ্ট নেই`);
      }

      items.push({
        productId: product._id,
        name: product.title,
        images: product.images.map((img) => img.url),
        price: product.price,       // checkout-এর সময়ের live price snapshot
        quantity: cartItem.quantity,
      });
    }

    // ৬. মোট হিসাব করো
    const subTotalAmt = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const totalAmt = subTotalAmt; // পরে shipping/discount যোগ করতে পারবে

    // ৭. Address snapshot বানাও (live address-এর reference না, copy)
    const delivery_address = {
      address_line: address.address_line,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
      mobile: address.mobile,
    };

    return { items, subTotalAmt, totalAmt, delivery_address, cartItems };
  },

  /**
   * Cash on delivery অর্ডার — সাথে সাথে confirm
   */
  async placeCodOrder({ userId, addressId }) {
    const { items, subTotalAmt, totalAmt, delivery_address, cartItems } =
      await this.buildOrderPayload({ userId, addressId });

    // Stock কমাও
    await Promise.all(
      items.map((item) =>
        productRepository.decrementStock(item.productId, item.quantity),
      ),
    );

    // অর্ডার save করো
    const order = await orderRepository.create({
      userId,
      orderId: generateOrderId(),
      items,
      delivery_address,
      subTotalAmt,
      totalAmt,
      payment_status: "Pending",
      order_status: "Processing",
    });

    // Cart খালি করো
    await cartRepository.deleteManyByIds(cartItems.map((c) => c._id));

    return order;
  },

  /**
   * Online payment সফল হওয়ার পর অর্ডার finalize করো
   */
  async finalizeOnlineOrder({ userId, addressId, paymentId, gatewayOrderId }) {
    const { items, subTotalAmt, totalAmt, delivery_address, cartItems } =
      await this.buildOrderPayload({ userId, addressId });

    // Stock কমাও
    await Promise.all(
      items.map((item) =>
        productRepository.decrementStock(item.productId, item.quantity),
      ),
    );

    // অর্ডার save করো — এবার Paid
    const order = await orderRepository.create({
      userId,
      orderId: gatewayOrderId || generateOrderId(),
      items,
      delivery_address,
      subTotalAmt,
      totalAmt,
      paymentId,
      payment_status: "Paid",
      order_status: "Processing",
    });

    // Cart খালি করো
    await cartRepository.deleteManyByIds(cartItems.map((c) => c._id));

    return order;
  },

  /**
   * User-এর সব অর্ডার দেখাও
   */
  async getUserOrders(userId) {
    return orderRepository.findByUserId(userId);
  },

  /**
   * একটা নির্দিষ্ট অর্ডার দেখাও
   * userId দিলে — user নিজের অর্ডার দেখছে
   * userId না দিলে — admin যেকোনো অর্ডার দেখতে পারবে
   */
  async getSingleOrder({ orderId, userId }) {
    const order = userId
      ? await orderRepository.findByIdAndUserId({ orderId, userId })
      : await orderRepository.findById(orderId);

    if (!order) throw new ApiError(404, "Order not found");
    return order;
  },

  /**
   * Admin: সব অর্ডার filter + pagination সহ
   */
  async adminGetAllOrders({ payment_status, order_status, page = 1, limit = 20 }) {
    const filter = {};
    if (payment_status) filter.payment_status = payment_status;
    if (order_status) filter.order_status = order_status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      orderRepository.findAll({ filter, skip, limit }),
      orderRepository.countAll(filter),
    ]);

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Admin: অর্ডারের status update করো
   */
  async adminUpdateOrderStatus({ orderId, order_status, payment_status }) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    if (order_status) order.order_status = order_status;
    if (payment_status) order.payment_status = payment_status;

    return orderRepository.save(order);
  },
};

export default orderService;
