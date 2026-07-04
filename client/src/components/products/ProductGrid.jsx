import { useFilterStore } from "@/store/useFilterStore";
import ProductCardSkeleton from "../productCard/ProductCardSkeleton";
import ProductCard from "../productCard/ProductCard";
import ProductPagination from "./ProductPagination";

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

const ProductGrid = ({ data, isLoading, isError, isFetching }) => {
  const cursorStack = useFilterStore((s) => s.cursorStack);
  const goNextPage = useFilterStore((s) => s.goNextPage);
  const goPrevPage = useFilterStore((s) => s.goPrevPage);
  const goToPage = useFilterStore((s) => s.goToPage);

  if (isError) {
    return (
      <div className="py-20 text-center text-sm text-slate-500">
        Something went wrong loading products. Please try again.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {[...Array(6)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const products = data?.data?.products || [];

  if (products.length === 0) {
    return (
      <div className="py-20 text-center text-sm text-slate-500">
        No products match your filters.
      </div>
    );
  }

  return (
    <>
      <div
        className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}
      >
        {products.map((product) => (
          <ProductCard key={product._id} {...mapProductToCard(product)} />
        ))}
      </div>

      <div className="mt-8">
        <ProductPagination
          currentPage={cursorStack.length}
          hasMore={data?.data?.hasMore}
          isFetching={isFetching}
          onPrevious={goPrevPage}
          onNext={() => goNextPage(data?.data?.nextCursor)}
          onPageClick={goToPage}
          maxVisiblePages={5}
        />
      </div>
    </>
  );
};

export default ProductGrid;
