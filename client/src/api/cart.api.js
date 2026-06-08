import api from "./Axios";
// 1. Fetch Cart Items
export const getCartItems = async () => {
  const res = await api.get("/cart");
  return res.data;
};

// 2. Add product to cart (or increment by 1 on backend)
export const addToCartApi = async ({ productId }) => {
  const res = await api.post("/cart/addToCart", { productId });
  return res.data;
};

// 3. Completely remove product from cart
export const removeFromCartApi = async ({ productId }) => {
  const res = await api.delete("/cart/removeFromCart", { data: { productId } });
  return res.data;
};

// 4. Update quantity explicitly (Useful for -1 increments or manual inputs)
export const updateQuantityApi = async ({ productId, quantity }) => {
  const res = await api.patch(`/cart/updateQuantity/${productId}`, {
    quantity,
  });
  return res.data;
};
