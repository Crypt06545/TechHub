// PATH: src/components/products/Productsection.jsx
// FILE: Productsection.jsx

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useProductSection } from "@/hooks/useProducts";
import ProductCardSkeleton from "../productCard/ProductCardSkeleton";
import ProductCard from "../productCard/ProductCard";

const getDefaultVariant = (product) => {
  if (!product.hasVariants || !product.variants?.length) return null;
  return product.variants.find((v) => v.stock > 0) || product.variants[0];
};

const SECTION_BADGE = {
  featured: { type: "featured", text: "Featured" },
  "hot deal": { type: "sale", text: "Hot Deal" },
  "new arrival": { type: "success", text: "New Arrival" },
  "best seller": { type: "warning", text: "Best Seller" },
};

// Priority: out of stock > explicit per-product badge > this row's
// section badge > auto-detected sale (fallback only, no section context).
const getProductBadge = (product, section) => {
  const stock = getDefaultVariant(product)?.stock ?? product.stock;
  if (stock === 0) return { type: "dark", text: "Out of Stock" };

  // FIX: `product.badge` was truthy-checked before. If the API returns
  // `badge: {}` (empty object, not null) — common when a schema defaults
  // the field instead of omitting it — that empty object is still
  // truthy, so this returned it and the section badge below never ran.
  // Checking `.text` specifically closes that hole.
  if (product.badge?.text) return product.badge;

  const sectionBadge = SECTION_BADGE[section?.toLowerCase()];
  if (sectionBadge) return sectionBadge;

  if (product.compareAtPrice > product.price)
    return { type: "sale", text: "Sale" };

  return null;
};

const mapProductToCard = (product, section) => {
  const defaultVariant = getDefaultVariant(product);
  const stock = defaultVariant ? defaultVariant.stock : product.stock;

  return {
    productId: product._id,
    slug: product.slug,
    image: product.images?.[0]?.url || "/placeholder.png",
    title: product.title,
    subtitle: product.description,
    price: defaultVariant ? defaultVariant.price : product.price,
    oldPrice: product.compareAtPrice,
    rating: product.ratingAverage,
    reviews: product.ratingCount,
    stock,
    outOfStock: stock === 0,
    badge: getProductBadge(product, section),
    hasVariants: product.hasVariants,
    defaultVariant,
  };
};

const ProductSection = ({
  section,
  title,
  subtitle,
  viewAllHref,
  limit = 5,
}) => {
  const { data, isLoading, isError } = useProductSection(section);

  const href =
    viewAllHref || `/products?section=${encodeURIComponent(section)}`;

  if (isError) return null;

  const products = (data?.data?.products || data?.products || []).slice(
    0,
    limit,
  );

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="border-t border-gray-100 bg-white py-10 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-gray-100 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                  {title}
                </h2>
              </div>
              {subtitle && (
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  {subtitle}
                </p>
              )}
            </div>

            <Link
              to={href}
              className="group inline-flex items-center gap-1 self-start text-sm font-semibold text-black transition-colors hover:text-gray-600 sm:self-auto"
            >
              See All
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {isLoading
            ? Array.from({ length: limit }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : products.map((product) => (
                <ProductCard
                  key={product._id}
                  {...mapProductToCard(product, section)}
                />
              ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
