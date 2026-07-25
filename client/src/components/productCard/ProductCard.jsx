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
}) => {
  // Convert Quill HTML -> Plain Text
  const getPlainText = (html = "") => {
    // Remove dangerous HTML
    const clean = DOMPurify.sanitize(html);

    // Create temporary DOM element
    const div = document.createElement("div");
    div.innerHTML = clean;

    // Get plain text (decodes &nbsp; &amp; etc.)
    const text = div.textContent || div.innerText || "";

    // Remove extra spaces/new lines
    return text.replace(/\s+/g, " ").trim();
  };

  const plainSubtitle = getPlainText(subtitle);

  return (
    <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-4">
      <ProductBadge
        badge={badge}
        productId={productId}
        image={image}
        title={title}
        subtitle={plainSubtitle}
        price={price}
        oldPrice={oldPrice}
        slug={slug}
      />

      <Link to={`/products/${slug}`} className="block">
        <div className="relative mb-3 flex h-[120px] items-center justify-center overflow-hidden rounded-lg bg-gray-50 p-2 sm:h-[140px] md:h-[150px]">
          <img
            src={image}
            alt={title}
            className="max-h-[100px] max-w-full object-contain transition-transform duration-500 group-hover:scale-105 sm:max-h-[120px] md:max-h-[130px]"
          />

          {!outOfStock && <ProductActions slug={slug} />}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2">
        <Link to={`/products/${slug}`} className="block">
          <h3 className="line-clamp-2 break-words text-sm font-semibold leading-snug text-gray-900 transition-colors hover:text-gray-600 sm:text-[15px]">
            {title}
          </h3>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
            {plainSubtitle}
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
            subtitle={plainSubtitle}
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
