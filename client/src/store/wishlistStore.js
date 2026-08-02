// PATH: src/store/wishlistStore.js
// FILE: wishlistStore.js

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Same identity rule as cartStore: a wishlist "line" is product + variant.
// Non-variant products fall back to plain _id, so nothing else changes
// for existing non-variant flows.
export const getLineId = (item) =>
  item.variantId ? `${item._id}__${item.variantId}` : item._id;

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      // ===========================
      // Toggle item (add if missing, remove if present)
      // ===========================
      toggleItem: (product) => {
        set((state) => {
          const lineId = getLineId(product);
          const exists = state.items.find((i) => getLineId(i) === lineId);

          if (exists) {
            return {
              items: state.items.filter((i) => getLineId(i) !== lineId),
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
          const lineId = getLineId(product);
          const exists = state.items.find((i) => getLineId(i) === lineId);
          if (exists) return state;

          return {
            items: [...state.items, { ...product }],
          };
        });
      },

      // ===========================
      // Remove Item
      // lineId: plain productId for non-variant items, or
      //         `${productId}__${variantId}` for variant lines
      // ===========================
      removeItem: (lineId) =>
        set((state) => ({
          items: state.items.filter((item) => getLineId(item) !== lineId),
        })),

      // ===========================
      // Clear Wishlist
      // ===========================
      clearWishlist: () => set({ items: [] }),

      // ===========================
      // Helpers
      // ===========================
      isInWishlist: (lineId) =>
        get().items.some((i) => getLineId(i) === lineId),

      totalItems: () => get().items.length,
    }),
    {
      name: "wishlistStore",
    },
  ),
);
