import { useFilterStore } from "@/store/useFilterStore";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const ProductToolbar = ({ resultsCount }) => {
  const sort = useFilterStore((s) => s.filters.sort);
  const setSort = useFilterStore((s) => s.setSort);

  return (
    <div className="flex items-center justify-between h-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 mb-4 px-4 shadow-sm">
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {resultsCount != null ? `${resultsCount} products` : ""}
      </span>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="text-sm bg-transparent border border-slate-200 dark:border-slate-800 rounded-md px-2 py-1 text-slate-700 dark:text-slate-300"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProductToolbar;
