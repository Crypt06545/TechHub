import { Button } from "@/components/ui/button";
import { useFilterStore } from "@/store/useFilterStore";
import ProductCardSkeleton from "../productCard/ProductCardSkeleton";
import ProductCard from "../productCard/ProductCard";

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

  if (isError) {
    return (
      <div className="py-20 text-center text-sm text-slate-500">
        Something went wrong loading products. Please try again.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
        className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}
      >
        {products.map((product) => (
          <ProductCard key={product._id} {...mapProductToCard(product)} />
        ))}
      </div>

      <div className="flex justify-center items-center gap-3 mt-8">
        <Button
          variant="outline"
          onClick={goPrevPage}
          disabled={cursorStack.length <= 1 || isFetching}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => goNextPage(data?.data?.nextCursor)}
          disabled={!data?.data?.hasMore || isFetching}
        >
          Next
        </Button>
      </div>
    </>
  );
};

export default ProductGrid;
