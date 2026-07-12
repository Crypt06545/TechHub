import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      // ===========================
      // Toggle item (add if missing, remove if present)
      // ===========================
      toggleItem: (product) => {
        set((state) => {
          const exists = state.items.find((i) => i._id === product._id);

          if (exists) {
            return {
              items: state.items.filter((i) => i._id !== product._id),
            };
          }

          return {
            items: [...state.items, { ...product }],
          };
        });
      },

      // ===========================
      // Add Item (no-op if already present)
      // ===========================
      addItem: (product) => {
        set((state) => {
          const exists = state.items.find((i) => i._id === product._id);
          if (exists) return state;

          return {
            items: [...state.items, { ...product }],
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
      // Clear Wishlist
      // ===========================
      clearWishlist: () => set({ items: [] }),

      // ===========================
      // Helpers
      // ===========================
      isInWishlist: (id) => get().items.some((i) => i._id === id),

      totalItems: () => get().items.length,
    }),
    {
      name: "wishlistStore",
    },
  ),
);
