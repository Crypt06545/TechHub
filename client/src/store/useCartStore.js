import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  cartItems: [],

  setCart: (items) => set({ cartItems: Array.isArray(items) ? items : [] }),

  clearCart: () => set({ cartItems: [] }),

  getItemQuantity: (productId) => {
    const item = get().cartItems.find(
      (item) => (item.productId?._id || item.productId) === productId,
    );
    return item ? item.quantity : 0;
  },
}));
