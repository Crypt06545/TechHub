import { useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useProductDetails } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ArrowLeftRight, Star, Truck, RefreshCw, ShieldCheck, Link2, Check } from "lucide-react";

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
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="w-16 h-16 rounded-lg" />)}
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
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);

  const imgRef = useRef(null);

  // GSAP smooth fade+slide on image change
  const changeImage = useCallback((index) => {
    if (index === selectedImage) return;
    const el = imgRef.current;
    if (!el) return;

    gsap.to(el, {
      opacity: 0,
      y: 6,
      duration: 0.15,
      ease: "power2.in",
      onComplete: () => {
        setSelectedImage(index);
        gsap.fromTo(
          el,
          { opacity: 0, y: -6 },
          { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
        );
      },
    });
  }, [selectedImage]);

  // Web Share API with clipboard fallback
  const handleShare = async () => {
    const shareData = {
      title: data?.data?.product?.title,
      text: `Check out this product on Senzo`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) return <ProductDetailsSkeleton />;
  if (isError) return <div className="text-center py-20 text-red-500">{error.message}</div>;
  if (!data) return <div className="text-center py-20 text-gray-400">Product not found.</div>;

  const product = data.data.product;
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-gray-700 transition-colors">{product.category}</Link>
        <span>/</span>
        <span className="text-gray-700 truncate max-w-[200px]">{product.title}</span>
      </nav>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">

        {/* Left — images */}
        <div>
          <div className="aspect-[4/3] rounded-xl border border-gray-100 bg-gray-50 overflow-hidden mb-3 flex items-center justify-center">
            <img
              ref={imgRef}
              src={product.images[selectedImage]?.url}
              alt={product.title}
              className="w-full h-full object-contain p-4"
            />
          </div>
          <div className="flex gap-2">
            {product.images.map((img, i) => (
              <button
                key={img.publicId}
                onClick={() => changeImage(i)}
                className={`w-16 h-16 rounded-lg border-2 overflow-hidden bg-gray-50 transition-colors flex-shrink-0 ${
                  selectedImage === i
                    ? "border-gray-900"
                    : "border-gray-100 hover:border-gray-300"
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-contain p-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Right — info */}
        <div className="flex flex-col gap-5">

          {/* Title + rating + SKU */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2 leading-snug">
              {product.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-700">{product.ratingAverage}</span>
                <span>({product.ratingCount} reviews)</span>
              </div>
              <span>·</span>
              <span>SKU: {product._id.slice(-8).toUpperCase()}</span>
            </div>
          </div>

          <Separator />

          {/* Price + description */}
          <div>
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-3xl font-bold text-gray-900">
                ৳{product.price.toLocaleString()}
              </span>
              {product.compareAtPrice && (
                <>
                  <span className="text-base text-gray-400 line-through">
                    ৳{product.compareAtPrice.toLocaleString()}
                  </span>
                  {discount && (
                    <Badge className="bg-red-50 text-red-600 border-0 font-medium text-xs">
                      -{discount}%
                    </Badge>
                  )}
                </>
              )}
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>
          </div>

          <Separator />

          {/* Qty + Add to cart */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg select-none"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-medium text-gray-800">{qty}</span>
              <button
                onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg select-none"
              >
                +
              </button>
            </div>
            <Button
              className="flex-1 bg-gray-900 hover:bg-gray-700 text-white h-10"
              disabled={product.stock === 0}
            >
              Add to Cart
            </Button>
          </div>

          <Button
            variant="outline"
            className="w-full h-10 border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={product.stock === 0}
          >
            Buy Now
          </Button>

          {/* Meta actions */}
          <div className="flex items-center gap-5 text-sm text-gray-500">
            <button className="flex items-center gap-1.5 hover:text-gray-800 transition-colors">
              <Heart className="w-4 h-4" /> Add to Wishlist
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:text-gray-800 transition-colors"
            >
              {copied ? (
                <><Check className="w-4 h-4 text-green-500" /> <span className="text-green-500">Link copied</span></>
              ) : (
                <><Link2 className="w-4 h-4" /> Share</>
              )}
            </button>
            <button className="flex items-center gap-1.5 hover:text-gray-800 transition-colors">
              <ArrowLeftRight className="w-4 h-4" /> Compare
            </button>
          </div>

          <Separator />

          {/* Delivery / return / stock */}
          <div className="flex flex-col gap-2.5 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 shrink-0" />
              <span>Estimated delivery: 3–5 business days</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 shrink-0" />
              <span>Return within 30 days. Taxes are non-refundable.</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              {product.stock > 0 ? (
                <span>
                  Availability:{" "}
                  <span className="text-green-600 font-medium">
                    Only {product.stock} left in stock
                  </span>
                </span>
              ) : (
                <span className="text-red-500 font-medium">Out of stock</span>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="text-sm text-gray-500">
            Category:{" "}
            <Link
              to={`/products?category=${product.category}`}
              className="text-gray-700 hover:underline"
            >
              {product.category}
            </Link>
          </div>

        </div>
      </div>

      {/* Related products placeholder */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Products</h2>
        <p className="text-sm text-gray-400">Related products will appear here.</p>
      </div>

    </div>
  );
};

export default ProductDetails;
