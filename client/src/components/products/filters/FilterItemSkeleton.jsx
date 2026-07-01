import { Skeleton } from "@/components/ui/skeleton";

const FilterItemSkeleton = ({ count = 5 }) => (
  <div className="space-y-3 pt-1 animate-pulse">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex items-center space-x-3">
        <Skeleton className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-800 shrink-0" />
        <Skeleton
          className={`h-3 bg-slate-200 dark:bg-slate-800 ${i % 2 === 0 ? "w-28" : "w-20"}`}
        />
      </div>
    ))}
  </div>
);

export default FilterItemSkeleton;
