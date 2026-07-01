import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import FilterSidebar from "@/components/products/filters/FilterSidebar";
import ProductGrid from "@/components/products/ProductGrid";
import ProductToolbar from "@/components/products/ProductToolbar";
import { useProducts } from "@/hooks/useProducts";
import { useFilterSync } from "@/hooks/useFilterSync";
import { useFilterStore } from "@/store/useFilterStore";

const ProductPage = () => {
  const filters = useFilterSync();
  const cursorStack = useFilterStore((s) => s.cursorStack);
  const currentCursor = cursorStack[cursorStack.length - 1];

  const { data, isLoading, isError, isFetching } = useProducts(
    filters,
    currentCursor,
  );
  console.log(data);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              All Products
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Browse and manage all your products in one place.
            </p>
          </div>

          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto gap-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-full sm:max-w-md p-6 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800"
              >
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-left text-lg font-semibold">
                    Filter Products
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Narrow down products by category, price, and brand.
                  </SheetDescription>
                </SheetHeader>
                <div className="overflow-y-auto h-[calc(100vh-8rem)] pr-2">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-6 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto shadow-sm">
              <FilterSidebar />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <ProductToolbar resultsCount={data?.data?.products?.length} />
            <ProductGrid
              data={data}
              isLoading={isLoading}
              isError={isError}
              isFetching={isFetching}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
