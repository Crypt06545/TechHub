import { Checkbox } from "@/components/ui/checkbox";
import { useGetCategories } from "@/hooks/useProducts";
import { useFilterStore } from "@/store/useFilterStore";
import FilterItemSkeleton from "./FilterItemSkeleton";

const CategoryFilter = () => {
  const { data, isLoading } = useGetCategories();
  const categories = data?.data?.categories || [];
  const selected = useFilterStore((s) => s.filters.categories);
  const toggleCategory = useFilterStore((s) => s.toggleCategory);

  if (isLoading) return <FilterItemSkeleton />;

  return (
    <div className="space-y-3">
      {categories.map((cat) => (
        <div key={cat._id} className="flex items-center space-x-3">
          <Checkbox
            id={`cat-${cat.slug}`}
            checked={selected.includes(cat.slug)}
            onCheckedChange={() => toggleCategory(cat.slug)}
          />
          <label
            htmlFor={`cat-${cat.slug}`}
            className="text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer"
          >
            {cat.name}
          </label>
        </div>
      ))}
    </div>
  );
};

export default CategoryFilter;
