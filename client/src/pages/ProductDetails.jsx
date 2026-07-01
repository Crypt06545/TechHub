import { useParams } from "react-router-dom";
import { useProductDetails } from "@/hooks/useProducts";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductBreadcrumb } from "@/components/common/ProductBreadcrumb";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductInfo } from "@/components/ProductInfo";

// ─── Skeleton ────────────────────────────────────────────────────────────────
const ProductDetailsSkeleton = () => (
  <div className="container mx-auto px-4 lg:px-6 py-6">
    <div className="flex items-center gap-1.5 mb-6">
      <Skeleton className="h-4 w-10" />
      <Skeleton className="h-4 w-2" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-2" />
      <Skeleton className="h-4 w-40" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
      <div>
        <Skeleton className="aspect-[4/3] w-full rounded-xl mb-3" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="w-16 h-16 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div>
          <Skeleton className="h-7 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Separator />
        <div>
          <Skeleton className="h-8 w-40 mb-3" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-5/6 mb-1" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <Separator />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 flex-1" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Separator />
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-4 w-36" />
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductDetails = () => {
  const { slug } = useParams();
  const { data, isLoading, isError, error } = useProductDetails(slug);

  if (isLoading) return <ProductDetailsSkeleton />;
  if (isError)
    return (
      <div className="text-center py-20 text-red-500">{error.message}</div>
    );
  if (!data)
    return (
      <div className="text-center py-20 text-gray-400">Product not found.</div>
    );

  const product = data.data.product;

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6">
      {/* Breadcrumb */}
      <ProductBreadcrumb
        categoryName={product.category?.name}
        categorySlug={product.category?.slug}
        title={product.title}
      />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
        {/* Left — images */}
        <ProductGallery images={product.images} title={product.title} />

        {/* Right — info */}
        <ProductInfo product={product} />
      </div>

      {/* Related products placeholder */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Related Products
        </h2>
        <p className="text-sm text-gray-400">
          Related products will appear here.
        </p>
      </div>
    </div>
  );
};

export default ProductDetails;
