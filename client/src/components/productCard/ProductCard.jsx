import React from "react";
import { Link } from "react-router-dom";
import ProductBadge from "./ProductBadge";
import ProductActions from "./ProductActions";
import ProductRating from "./ProductRating";
import ProductPrice from "./ProductPrice";
import AddToCartButton from "./AddToCartButton";

const ProductCard = ({
  image,
  title,
  subtitle,
  price,
  oldPrice,
  rating,
  reviews,
  stock,
  badge,
  isWishlisted,
  outOfStock,
  productId,
  slug,
}) => {
  return (
    <div className="group relative w-full rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md overflow-hidden flex flex-col">
      <ProductBadge badge={badge} isWishlisted={isWishlisted} />

      <Link to={`/products/${slug}`} className="block">
        <div className="relative mb-3 flex h-[120px] sm:h-[140px] md:h-[150px] items-center justify-center overflow-hidden bg-gray-50 rounded-lg p-2">
          <img
            src={image}
            alt={title}
            className="max-h-[100px] sm:max-h-[120px] md:max-h-[130px] w-auto max-w-full object-contain transition-all duration-500 group-hover:scale-105"
          />
          {!outOfStock && <ProductActions slug={slug} />}
        </div>
      </Link>

      <div className="flex flex-col flex-1 gap-2">
        <Link to={`/products/${slug}`} className="block">
          <h3 className="line-clamp-2 text-sm sm:text-[15px] font-semibold leading-snug text-gray-900 break-words hover:text-gray-600 transition-colors">
            {title}
          </h3>
          <p className="mt-1 line-clamp-1 text-[11px] sm:text-xs text-gray-500">
            {subtitle}
          </p>
        </Link>

        <ProductRating rating={rating} reviews={reviews} />

        <ProductPrice price={price} oldPrice={oldPrice} stock={stock} />

        <div className="mt-auto">
          <AddToCartButton
            productId={productId}
            stock={stock}
            outOfStock={outOfStock}
            image={image}
            title={title}
            subtitle={subtitle}
            price={price}
            oldPrice={oldPrice}
            slug={slug}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
