import { Link } from "react-router-dom";

export const ProductBreadcrumb = ({ categoryName, categorySlug, title }) => {
  return (
    <nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-500">
      <Link to="/" className="transition-colors hover:text-gray-900">
        Home
      </Link>

      <span>/</span>

      <Link
        to={`/products?categories=${categorySlug}`}
        className="transition-colors hover:text-gray-900"
      >
        {categoryName}
      </Link>

      <span>/</span>

      <span className="max-w-[220px] truncate text-gray-900">{title}</span>
    </nav>
  );
};
