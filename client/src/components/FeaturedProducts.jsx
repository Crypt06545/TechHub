import { useFeaturedProducts } from "@/hooks/useProducts";
import ProductCardSkeleton from "./productCard/ProductCardSkeleton";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductCard from "./productCard/ProductCard";

const FeaturedProducts = () => {
  const { data, isLoading, error } = useFeaturedProducts();
  // console.log(data);

  // FIXED: Flipped logic rules so 'isFeatured' takes priority over 'Sale'
  const getProductBadge = (product) => {
    if (product.stock === 0) return { type: "dark", text: "Out of Stock" };
    if (product.isFeatured) return { type: "success", text: "Featured" };
    if (product.compareAtPrice > product.price)
      return { type: "sale", text: "Sale" };
    return null;
  };

  // 1. FIXED LOADING STATE: Added explicit 'return' statement
  if (isLoading) {
    return (
      <section className="px-4 mx-auto sm:px-6 lg:px-8">
        {/* Skeleton Header */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
          <div className="space-y-2 w-1/3">
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </div>
          <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
        </div>

        {/* Skeleton Grid */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  // 2. ERROR STATE
  if (error) {
    return (
      <div className="py-12 text-center text-red-500 font-medium">
        Failed to load featured products. Please try again later.
      </div>
    );
  }

  const products = data?.data?.products?.slice(0, 5) || [];

  return (
    <section className="py-12 px-4 container mx-auto sm:px-6 lg:px-8">
      {/* Real-World E-commerce Header Row */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Featured Products
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Our top picks and trending devices selected just for you.
          </p>
        </div>

        {/* FIXED: Changed 'href' to 'to' for react-router-dom Link compatibility */}
        <Link
          to="/products"
          className="group flex items-center gap-1 text-sm font-semibold text-black hover:text-gray-600 transition-colors"
        >
          See All
          <ArrowRight
            size={16}
            className="transform transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>

      {/* Product Grid Loop */}
      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          No featured products available right now.
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {products.map((product, index) => (
            <ProductCard
              key={product._id}
              productId={product._id}
              slug={product.slug}
              title={product.title}
              subtitle={product.description}
              price={product.price}
              oldPrice={product.compareAtPrice}
              rating={product.ratingAverage}
              reviews={product.ratingCount}
              stock={product.stock}
              image={product.images?.[0]?.url || "/placeholder.png"}
              badge={getProductBadge(product)}
              outOfStock={product.stock === 0}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedProducts;
