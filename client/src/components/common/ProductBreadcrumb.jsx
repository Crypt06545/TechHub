import { Link } from "react-router-dom";

export const ProductBreadcrumb = ({ category, title }) => {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
      <Link to="/" className="hover:text-gray-700 transition-colors">
        Home
      </Link>
      <span>/</span>
      <Link to={`/products?category=${category}`} className="hover:text-gray-700 transition-colors">
        {category}
      </Link>
      <span>/</span>
      <span className="text-gray-700 truncate max-w-50">{title}</span>
    </nav>
  );
};
