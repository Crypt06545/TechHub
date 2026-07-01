import { useState, useEffect } from "react";
import { useFilterStore } from "@/store/useFilterStore";

const PriceRangeFilter = ({ min = 0, max = 100000 }) => {
  const priceRange = useFilterStore((s) => s.filters.priceRange);
  const priceTouched = useFilterStore((s) => s.filters.priceTouched);
  const setPriceRange = useFilterStore((s) => s.setPriceRange);

  const [minInput, setMinInput] = useState(priceRange[0] || "");
  const [maxInput, setMaxInput] = useState(priceRange[1] || "");

  useEffect(() => {
    setMinInput(priceRange[0] || "");
    setMaxInput(priceRange[1] || "");
  }, [priceRange]);

  const handleApply = () => {
    const minVal = Number(minInput) || 0;
    const maxVal = Number(maxInput) || max;
    if (minVal > maxVal) return; // invalid, ignore
    setPriceRange([minVal, maxVal]);
  };

  const handleClear = () => {
    setMinInput("");
    setMaxInput("");
    setPriceRange([0, max]); // priceTouched false korte hobe store e alada logic diye, niche note dekho
  };

  return (
    <div className="pt-3 pb-1 px-1 space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Min"
          value={minInput}
          onChange={(e) => setMinInput(e.target.value)}
          className="w-full rounded-md border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
        />
        <span className="text-slate-400 text-xs">to</span>
        <input
          type="number"
          placeholder="Max"
          value={maxInput}
          onChange={(e) => setMaxInput(e.target.value)}
          className="w-full rounded-md border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleApply}
          className="flex-1 text-xs bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-md py-1.5"
        >
          Apply
        </button>
        {priceTouched && (
          <button
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-slate-600 px-2"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default PriceRangeFilter;
