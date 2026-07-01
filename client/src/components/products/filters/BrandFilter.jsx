import { Checkbox } from "@/components/ui/checkbox";
import { useFilterStore } from "@/store/useFilterStore";
import FilterItemSkeleton from "./FilterItemSkeleton";

const BrandFilter = ({ brands = [], isLoading }) => {
  const selected = useFilterStore((s) => s.filters.brands);
  const toggleBrand = useFilterStore((s) => s.toggleBrand);

  if (isLoading) return <FilterItemSkeleton />;

  return (
    <div className="space-y-3">
      {brands.map((brand) => (
        <div key={brand} className="flex items-center space-x-3">
          <Checkbox
            id={`brand-${brand}`}
            checked={selected.includes(brand)}
            onCheckedChange={() => toggleBrand(brand)}
          />
          <label
            htmlFor={`brand-${brand}`}
            className="text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer"
          >
            {brand}
          </label>
        </div>
      ))}
    </div>
  );
};

export default BrandFilter;
