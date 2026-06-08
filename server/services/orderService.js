import { orderRepository } from "../repositories/order.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { generateOrderId } from "../utils/generateOrderId.js";
import { ApiError } from "../utils/ApiError.js";
import { cartRepository } from "../repositories/cartRepository.js";
import { addressRepository } from "../repositories/addressRepository.js";

const orderService = {
  /**
   * Validates cart, checks stock, builds order payload.
   * Writes nothing to DB — only prepares data.
   */
  async buildOrderPayload({ userId, addressId }) {
    const address = await addressRepository.findByIdAndUserId({ addressId, userId });
    if (!address) throw new ApiError(404, "Address not found");

    const cartItems = await cartRepository.findByUserId(userId);
    if (!cartItems.length) throw new ApiError(400, "Cart is empty");

    const productIds = cartItems.map((c) => c.productId);
    const products   = await productRepository.findByIds(productIds);

    const productMap = Object.fromEntries(
      products.map((p) => [p._id.toString(), p]),
    );

    const items = [];
    for (const cartItem of cartItems) {
      const product = productMap[cartItem.productId.toString()];

      if (!product) {
        throw new ApiError(404, "Product not found");
      }
      if (!product.isPublished || product.isArchived) {
        throw new ApiError(400, `"${product.title}" is not available`);
      }
      if (product.stock < cartItem.quantity) {
        throw new ApiError(400, `"${product.title}" is out of stock`);
      }

      items.push({
        productId: product._id,
        name:      product.title,
        images:    product.images.map((img) => img.url),
        price:     product.price,
        quantity:  cartItem.quantity,
      });
    }

    const subTotalAmt = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const totalAmt = subTotalAmt;

    const delivery_address = {
      address_line: address.address_line,
      city:         address.city,
      state:        address.state,
      pincode:      address.pincode,
      country:      address.country,
      mobile:       address.mobile,
    };

    return { items, subTotalAmt, totalAmt, delivery_address, cartItems };
  },

  // ─── COD ──────────────────────────────────────────────────────────────────

  async placeCodOrder({ userId, addressId }) {
    const { items, subTotalAmt, totalAmt, delivery_address, cartItems } =
      await this.buildOrderPayload({ userId, addressId });

    await Promise.all(
      items.map((item) =>
        productRepository.decrementStock(item.productId, item.quantity),
      ),
    );

    const order = await orderRepository.create({
      userId,
      orderId: generateOrderId(),
      items,
      delivery_address,
      subTotalAmt,
      totalAmt,
      payment_status: "Pending",
      order_status:   "Processing",
    });

    await cartRepository.deleteManyByIds(cartItems.map((c) => c._id));

    return order;
  },

  // ─── Online payment finalize (called by payment.service after verification) ─

  async finalizeOnlineOrder({ userId, addressId, paymentId, gatewayOrderId }) {
    const { items, subTotalAmt, totalAmt, delivery_address, cartItems } =
      await this.buildOrderPayload({ userId, addressId });

    await Promise.all(
      items.map((item) =>
        productRepository.decrementStock(item.productId, item.quantity),
      ),
    );

    const order = await orderRepository.create({
      userId,
      orderId: gatewayOrderId || generateOrderId(),
      items,
      delivery_address,
      subTotalAmt,
      totalAmt,
      paymentId,
      payment_status: "Paid",
      order_status:   "Processing",
    });

    await cartRepository.deleteManyByIds(cartItems.map((c) => c._id));

    return order;
  },

  // ─── User queries ──────────────────────────────────────────────────────────

  async getUserOrders(userId) {
    return orderRepository.findByUserId(userId);
  },

  async getSingleOrder({ orderId, userId }) {
    const order = userId
      ? await orderRepository.findByIdAndUserId({ orderId, userId })
      : await orderRepository.findById(orderId);

    if (!order) throw new ApiError(404, "Order not found");
    return order;
  },

  // ─── Admin ────────────────────────────────────────────────────────────────

  async adminGetAllOrders({ payment_status, order_status, page = 1, limit = 20 }) {
    const filter = {};
    if (payment_status) filter.payment_status = payment_status;
    if (order_status)   filter.order_status   = order_status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      orderRepository.findAll({ filter, skip, limit }),
      orderRepository.countAll(filter),
    ]);

    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  },

  async adminUpdateOrderStatus({ orderId, order_status, payment_status }) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    if (order_status)   order.order_status   = order_status;
    if (payment_status) order.payment_status = payment_status;

    return orderRepository.save(order);
  },
};

export default orderService;
