import { create } from "zustand";
import { persist } from "zustand/middleware";

// A cart "line" is uniquely identified by product + variant (if any).
// Two different sizes/colors of the same product must never collapse
// into a single line — this is what keeps "Attar 3ml" and "Attar 12ml"
// as two separate rows in the cart, each with its own price and qty.
// For products with no variants, variantId is null/undefined and the
// line id just falls back to the plain product _id — so existing
// non-variant flows (e.g. AddToCartButton on the product cards) keep
// working exactly as before, no changes needed there.
export const getLineId = (item) =>
  item.variantId ? `${item._id}__${item.variantId}` : item._id;

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // ===========================
      // Add item (increment if exists)
      // ===========================
      addItem: (product, qty = 1) => {
        set((state) => {
          const lineId = getLineId(product);
          const existing = state.items.find((i) => getLineId(i) === lineId);

          if (existing) {
            return {
              items: state.items.map((item) =>
                getLineId(item) === lineId
                  ? {
                      ...item,
                      ...product, // refresh all product/variant fields
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

      // ===========================
      // Set exact quantity (used by ProductInfo's Add to Cart / Buy Now)
      // ===========================
      setItemQuantity: (product, qty) => {
        set((state) => {
          const lineId = getLineId(product);
          const exists = state.items.find((item) => getLineId(item) === lineId);

          // Remove if qty <= 0
          if (qty <= 0) {
            return {
              items: state.items.filter((item) => getLineId(item) !== lineId),
            };
          }

          // Update existing line while keeping all latest data
          if (exists) {
            return {
              items: state.items.map((item) =>
                getLineId(item) === lineId
                  ? {
                      ...item,
                      ...product,
                      quantity: qty,
                    }
                  : item,
              ),
            };
          }

          // Add new line
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
      // lineId: plain productId for non-variant items, or
      //         `${productId}__${variantId}` for variant lines
      //         (use the exported getLineId() helper to build this)
      // ===========================
      updateQty: (lineId, qty) => {
        set((state) => {
          if (qty < 1) {
            return {
              items: state.items.filter((i) => getLineId(i) !== lineId),
            };
          }

          return {
            items: state.items.map((i) =>
              getLineId(i) === lineId
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
      removeItem: (lineId) =>
        set((state) => ({
          items: state.items.filter((item) => getLineId(item) !== lineId),
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
      name: "cartStore",
    },
  ),
);
