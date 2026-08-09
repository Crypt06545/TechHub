import React from "react";
import DOMPurify from "dompurify";
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
  outOfStock,
  productId,
  slug,
  hasVariants,
  defaultVariant,
}) => {
  const getPlainText = (html = "") => {
    const clean = DOMPurify.sanitize(html);
    const div = document.createElement("div");
    div.innerHTML = clean;
    const text = div.textContent || div.innerText || "";
    return text.replace(/\s+/g, " ").trim();
  };

  const plainTitle = getPlainText(title);
  const plainSubtitle = getPlainText(subtitle);

  return (
    <div className="group relative flex h-full flex-col gap-2">
      <Link to={`/products/${slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
          <img
            src={image}
            alt={plainTitle}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <ProductBadge
            badge={badge}
            productId={productId}
            image={image}
            title={plainTitle}
            subtitle={plainSubtitle}
            price={price}
            oldPrice={oldPrice}
            slug={slug}
            hasVariants={hasVariants}
            defaultVariant={defaultVariant}
          />

          {!outOfStock && <ProductActions slug={slug} />}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Link to={`/products/${slug}`} className="block">
            <h3 className="line-clamp-2 break-words text-sm font-semibold leading-snug text-gray-900 transition-colors hover:text-gray-600 sm:text-[15px]">
              {plainTitle}
            </h3>
          </Link>

          {plainSubtitle && (
            <p className="line-clamp-2 text-xs leading-5 text-gray-500">
              {plainSubtitle}
            </p>
          )}

          <ProductRating rating={rating} reviews={reviews} />
        </div>

        <ProductPrice price={price} oldPrice={oldPrice} stock={stock} />

        <div className="mt-auto">
          <AddToCartButton
            productId={productId}
            stock={stock}
            outOfStock={outOfStock}
            image={image}
            title={plainTitle}
            subtitle={plainSubtitle}
            price={price}
            oldPrice={oldPrice}
            slug={slug}
            hasVariants={hasVariants}
            defaultVariant={defaultVariant}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
