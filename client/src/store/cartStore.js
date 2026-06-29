import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // ===========================
      // Add item (increment if exists)
      // ===========================
      addItem: (product, qty = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i._id === product._id);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item._id === product._id
                  ? {
                      ...item,
                      ...product, // <-- refresh all product fields
                      quantity: item.quantity + qty,
                    }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...product,
                quantity: qty,
              },
            ],
          };
        });
      },

      setItemQuantity: (product, qty) => {
        set((state) => {
          const exists = state.items.find((item) => item._id === product._id);

          // Remove if qty <= 0
          if (qty <= 0) {
            return {
              items: state.items.filter((item) => item._id !== product._id),
            };
          }

          // Update existing product while keeping all latest data
          if (exists) {
            return {
              items: state.items.map((item) =>
                item._id === product._id
                  ? {
                      ...item,
                      ...product,
                      quantity: qty,
                    }
                  : item,
              ),
            };
          }

          // Add new product
          return {
            items: [
              ...state.items,
              {
                ...product,
                quantity: qty,
              },
            ],
          };
        });
      },

      // ===========================
      // Update Quantity
      // ===========================
      updateQty: (id, qty) => {
        set((state) => {
          if (qty < 1) {
            return {
              items: state.items.filter((i) => i._id !== id),
            };
          }

          return {
            items: state.items.map((i) =>
              i._id === id
                ? {
                    ...i,
                    quantity: qty,
                  }
                : i,
            ),
          };
        });
      },

      // ===========================
      // Remove Item
      // ===========================
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item._id !== id),
        })),

      // ===========================
      // Clear Cart
      // ===========================
      clearCart: () => set({ items: [] }),

      // ===========================
      // Helpers
      // ===========================
      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: "techhub-cart",
    },
  ),
);
