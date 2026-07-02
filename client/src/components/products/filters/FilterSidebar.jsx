import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CategoryFilter from "./CategoryFilter";
import BrandFilter from "./BrandFilter";
import PriceRangeFilter from "./PriceRangeFilter";
import { useFilterStore } from "@/store/useFilterStore";
import { useGetFilterFacets } from "@/hooks/useProducts";

const FilterSidebar = () => {
  const resetFilters = useFilterStore((s) => s.resetFilters);
  const { data, isLoading } = useGetFilterFacets();
  const facets = data?.data;
  // console.log(facets);


  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Filters
          </h3>
          <button
            onClick={resetFilters}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Reset
          </button>
        </div>
        <hr className="border-slate-100 dark:border-slate-800" />
      </div>

      <Accordion
        type="multiple"
        defaultValue={["categories", "price", "brands"]}
        className="w-full"
      >
        <AccordionItem
          value="categories"
          className="border-b border-slate-100 dark:border-slate-800"
        >
          <AccordionTrigger className="text-sm font-medium text-slate-700 dark:text-slate-300 py-3 hover:no-underline">
            Categories
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-4">
            <CategoryFilter />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="price"
          className="border-b border-slate-100 dark:border-slate-800"
        >
          <AccordionTrigger className="text-sm font-medium text-slate-700 dark:text-slate-300 py-3 hover:no-underline">
            Price Range
          </AccordionTrigger>
          <AccordionContent>
            <PriceRangeFilter
              min={facets?.priceRange?.min ?? 0}
              max={facets?.priceRange?.max ?? 1000}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brands" className="border-none">
          <AccordionTrigger className="text-sm font-medium text-slate-700 dark:text-slate-300 py-3 hover:no-underline">
            Brands
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-2">
            <BrandFilter brands={facets?.brands || []} isLoading={isLoading} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FilterSidebar;
