import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // ── add or increment ──────────────────────────────────────────
      addItem: (product, qty = 1) => {
        set((state) => {
          const exists = state.items.find((i) => i._id === product._id);
          if (exists) {
            return {
              items: state.items.map((i) =>
                i._id === product._id
                  ? { ...i, quantity: i.quantity + qty }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...product, quantity: qty }] };
        });
      },

      // ── set absolute quantity ─────────────────────────────────────
      updateQty: (id, qty) => {
        if (qty < 1) return;
        set((state) => ({
          items: state.items.map((i) =>
            i._id === id ? { ...i, quantity: qty } : i,
          ),
        }));
      },

      // ── remove one line ───────────────────────────────────────────
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i._id !== id) })),

      // ── wipe cart ─────────────────────────────────────────────────
      clearCart: () => set({ items: [] }),

      // ── derived helpers ───────────────────────────────────────────
      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
      subtotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
    }),
    { name: "techhub-cart" }, // persisted to localStorage
  ),
);
