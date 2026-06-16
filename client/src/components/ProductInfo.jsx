import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Heart, ArrowLeftRight, Star, Truck,
  RefreshCw, ShieldCheck, Link2, Check
} from "lucide-react";

export const ProductInfo = ({ product }) => {
  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);

  // Calculate discount specifically for this view
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  // Web Share API with clipboard fallback
  const handleShare = async () => {
    const shareData = {
      title: product?.title,
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

  return (
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
  );
};
