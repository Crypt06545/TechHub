import { create } from "zustand";

const initialFilters = {
  categories: [],
  brands: [],
  priceRange: [0, 1000],
  priceTouched: false,
  sort: "newest",
};

export const useFilterStore = create((set) => ({
  filters: initialFilters,
  cursorStack: [null],

  toggleCategory: (slug) =>
    set((state) => ({
      filters: {
        ...state.filters,
        categories: state.filters.categories.includes(slug)
          ? state.filters.categories.filter((c) => c !== slug)
          : [...state.filters.categories, slug],
      },
      cursorStack: [null],
    })),

  toggleBrand: (brand) =>
    set((state) => ({
      filters: {
        ...state.filters,
        brands: state.filters.brands.includes(brand)
          ? state.filters.brands.filter((b) => b !== brand)
          : [...state.filters.brands, brand],
      },
      cursorStack: [null],
    })),

  setPriceRange: (range) =>
    set((state) => ({
      filters: { ...state.filters, priceRange: range, priceTouched: true },
      cursorStack: [null],
    })),

  clearPriceRange: (max) =>
    set((state) => ({
      filters: { ...state.filters, priceRange: [0, max], priceTouched: false },
      cursorStack: [null],
    })),

  setSort: (sort) =>
    set((state) => ({
      filters: { ...state.filters, sort },
      cursorStack: [null],
    })),

  resetFilters: () => set({ filters: initialFilters, cursorStack: [null] }),
  setAllFilters: (filters) => set({ filters }),

  goNextPage: (nextCursor) =>
    set((state) => ({ cursorStack: [...state.cursorStack, nextCursor] })),

  goPrevPage: () =>
    set((state) => ({
      cursorStack:
        state.cursorStack.length > 1
          ? state.cursorStack.slice(0, -1)
          : state.cursorStack,
    })),
}));
