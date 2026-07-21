import { Link, useParams } from "react-router-dom";
import { useProductDetails, useProducts } from "@/hooks/useProducts";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ProductBreadcrumb } from "@/components/common/ProductBreadcrumb";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductInfo } from "@/components/ProductInfo";
import ProductCard from "@/components/productCard/ProductCard";
import ProductCardSkeleton from "@/components/productCard/ProductCardSkeleton";

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

  // Product details
  const { data, isLoading, isError, error } = useProductDetails(slug);
  const product = data?.data?.product;
  console.log(product);
  
  const categorySlug = product?.category?.slug;

  // Related products — hook called unconditionally every render
  const { data: relatedData, isLoading: relatedLoading } = useProducts({
    categories: categorySlug ? [categorySlug] : [],
  });
  // console.log(relatedData);


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

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6">
      {/* Breadcrumb */}
      <ProductBreadcrumb
        categoryName={product.category?.name}
        categorySlug={product.category?.slug}
        title={product.title}
      />

      {/* Product */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        <ProductGallery images={product.images} title={product.title} />
        <ProductInfo product={product} />
      </div>

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
