// PATH: src/components/products/productCard/QuickViewModal.jsx
// FILE: QuickViewModal.jsx

import React from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowUpRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductInfo } from "@/components/ProductInfo";
import { useProductDetails } from "@/hooks/useProducts";

const QuickViewModal = ({ slug, open, onOpenChange }) => {
  const { data, isLoading, isError, error } = useProductDetails(
    open ? slug : undefined,
  );
  const product = data?.data?.product;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Outer shell: fixed max-height, its OWN overflow hidden — this is
          what gives the dialog a hard edge instead of growing forever. */}
      <DialogContent className="max-h-[90vh] w-[95vw] overflow-hidden p-0 sm:max-w-4xl">
        {/* Inner scroll container: this is what actually scrolls. The
            three bracketed classes hide the scrollbar visually across
            Chrome/Safari/Edge (::-webkit-scrollbar), Firefox
            (scrollbar-width), and old IE/Edge (-ms-overflow-style) —
            scrolling (wheel/touch/keyboard) still works exactly the
            same, only the visible bar is gone. */}
        <div className="max-h-[90vh] overflow-y-auto p-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <DialogHeader>
            {/* Visual title already comes from ProductInfo's own <h1> below —
                this is only here for screen readers, per Dialog's a11y requirement */}
            <DialogTitle className="sr-only">
              {product?.title || "Quick view"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Product details and purchase options
            </DialogDescription>
          </DialogHeader>

          {isLoading && (
            <div className="flex h-[50vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          )}

          {isError && (
            <div className="flex h-[30vh] flex-col items-center justify-center gap-2 text-center">
              <p className="text-sm font-medium text-gray-700">
                {error?.message || "Couldn't load this product"}
              </p>
            </div>
          )}

          {!isLoading && !isError && product && (
            <>
              <div className="grid grid-cols-1 gap-8 pt-2 lg:grid-cols-2">
                <ProductGallery images={product.images} title={product.title} />
                <ProductInfo product={product} />
              </div>

              <Link
                to={`/products/${product.slug}`}
                onClick={() => onOpenChange(false)}
                className="mt-6 flex items-center justify-center gap-1.5 border-t border-gray-100 pt-4 text-xs font-medium text-gray-500 transition-colors hover:text-gray-800"
              >
                View full product page <ArrowUpRight size={13} />
              </Link>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
