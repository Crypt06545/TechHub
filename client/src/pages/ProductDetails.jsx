import { Link, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { useProductDetails, useProducts } from "@/hooks/useProducts";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductBreadcrumb } from "@/components/common/ProductBreadcrumb";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductInfo } from "@/components/ProductInfo";
import ProductCard from "@/components/productCard/ProductCard";
import ProductCardSkeleton from "@/components/productCard/ProductCardSkeleton";
import { ShieldCheck, Truck, RefreshCw, BadgeCheck } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────
const mapProductToCard = (product) => ({
  productId: product._id,
  slug: product.slug,
  image: product.images?.[0]?.url,
  title: product.title,
  subtitle: product.category?.name,
  price: product.price,
  oldPrice: product.compareAtPrice,
  rating: product.ratingAverage,
  reviews: product.ratingCount,
  stock: product.stock,
  outOfStock: product.stock === 0,
});

// ─────────────────────────────────────────────────────────────
// Gallery-side trust/info strip — sits under the image gallery
// ─────────────────────────────────────────────────────────────
const GalleryInfoStrip = () => (
  <div className="mt-4 grid grid-cols-2 gap-3">
    {[
      {
        icon: BadgeCheck,
        label: "100% Authentic",
        sub: "Verified sellers only",
      },
      { icon: Truck, label: "Fast Delivery", sub: "3–5 business days" },
      { icon: RefreshCw, label: "Easy Returns", sub: "Within 30 days" },
      {
        icon: ShieldCheck,
        label: "Secure Checkout",
        sub: "Encrypted payments",
      },
    ].map(({ icon: Icon, label, sub }) => (
      <div
        key={label}
        className="flex items-start gap-2.5 rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <Icon className="h-4 w-4 text-gray-700" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-900 leading-tight">
            {label}
          </p>
          <p className="text-[11px] text-gray-500 leading-tight">{sub}</p>
        </div>
      </div>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────
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
        <Skeleton className="h-20 w-full rounded-xl mt-4" />
      </div>

      <div className="flex flex-col gap-5">
        <Skeleton className="h-8 w-2/3" />
        <Separator />
        <Skeleton className="h-40 w-full" />
        <Separator />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
const ProductDetails = () => {
  const { slug } = useParams();

  const { data, isLoading, isError, error } = useProductDetails(slug);
  const product = data?.data?.product;

  const categorySlug = product?.category?.slug;

  const { data: relatedData, isLoading: relatedLoading } = useProducts({
    categories: categorySlug ? [categorySlug] : [],
  });

  if (isLoading) return <ProductDetailsSkeleton />;

  if (isError) {
    return (
      <div className="py-20 text-center text-red-500">{error.message}</div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center text-gray-500">Product not found.</div>
    );
  }

  const relatedProducts =
    relatedData?.data?.products
      ?.filter((item) => item._id !== product._id)
      .slice(0, 4) || [];

  const hasDescription =
    product.description && product.description.trim().length > 0;

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6">
      {/* Breadcrumb */}
      <ProductBreadcrumb
        categoryName={product.category?.name}
        categorySlug={product.category?.slug}
        title={product.title}
      />

      {/* Product — compact top section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        <div>
          <ProductGallery images={product.images} title={product.title} />
          <GalleryInfoStrip />
        </div>
        <ProductInfo product={product} />
      </div>

      {/* Details / Specifications — long content lives here */}
      <section className="mb-16">
        <Tabs defaultValue="details" className="gap-4 w-full">
          <TabsList className="justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="details"
              className="data-active:border-b-background! data-active:border-border bg-transparent! shadow-none! data-active:-mb-0.75 data-active:rounded-b-none data-active:border-b-2"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="specifications"
              className="data-active:border-b-background! data-active:border-border bg-transparent! shadow-none! data-active:-mb-0.75 data-active:rounded-b-none data-active:border-b-2"
            >
              Specifications
            </TabsTrigger>
          </TabsList>

          {/* ── Details tab — the rich Quill description lives here ── */}
          <TabsContent value="details" className="pt-6">
            {hasDescription ? (
              <div
                className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(product.description),
                }}
              />
            ) : (
              <p className="text-sm text-gray-500">
                No additional details provided for this product.
              </p>
            )}
          </TabsContent>

          {/* ── Specifications tab ── */}
          <TabsContent value="specifications" className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-100 py-2">
                <span className="text-gray-500">Brand</span>
                <span className="font-medium text-gray-900">
                  {product.brand || "—"}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-2">
                <span className="text-gray-500">SKU</span>
                <span className="font-medium text-gray-900">
                  {product.sku || "—"}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-2">
                <span className="text-gray-500">Category</span>
                <span className="font-medium text-gray-900">
                  {product.category?.name || "—"}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-2">
                <span className="text-gray-500">Stock</span>
                <span className="font-medium text-gray-900">
                  {product.stock ?? "—"}
                </span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Related Products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Related Products</h2>

          {categorySlug && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/products?categories=${categorySlug}`}>See all</Link>
            </Button>
          )}
        </div>

        {relatedLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : relatedProducts.length === 0 ? (
          <div className="text-sm text-gray-500">
            No related products found.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item._id} {...mapProductToCard(item)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetails;
