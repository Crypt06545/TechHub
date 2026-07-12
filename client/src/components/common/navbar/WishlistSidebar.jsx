import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useWishlistStore } from "@/store/wishlistStore"; // adjust path if needed
import { useCartStore } from "@/store/cartStore";

/* ── Empty state ── */
const EmptyWishlist = () => (
  <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center py-12">
    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
      <Heart size={28} className="text-gray-300" strokeWidth={1.5} />
    </div>
    <div className="space-y-0.5">
      <p className="text-sm font-medium text-gray-700">
        Your wishlist is empty
      </p>
      <p className="text-xs text-gray-400">Save items you love for later</p>
    </div>
  </div>
);

/* ── Single wishlist row ── */
const WishlistRow = ({ item, onRemove, onAddToCart }) => {
  return (
    <div className="flex gap-3 py-3.5">
      <Link to={`/products/${item.slug}`} className="shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="h-14 w-14 rounded-xl border border-gray-100 bg-gray-50 object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/products/${item.slug}`}>
              <p className="truncate text-xs font-semibold text-gray-900 hover:text-gray-600 transition-colors">
                {item.name}
              </p>
            </Link>

            {item.subtitle && (
              <p className="mt-0.5 truncate text-[11px] text-gray-400">
                {item.subtitle}
              </p>
            )}

            <p className="mt-1 text-xs font-bold text-gray-900">
              ৳ {item.price?.toLocaleString()}
              {item.oldPrice && (
                <span className="ml-1.5 text-[10px] font-normal text-gray-400 line-through">
                  ৳ {item.oldPrice.toLocaleString()}
                </span>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item._id)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-red-50 hover:text-red-600"
            aria-label="Remove item"
          >
            <Trash2 size={16} strokeWidth={2.2} />
          </button>
        </div>

        <button
          onClick={() => onAddToCart(item)}
          disabled={item.outOfStock}
          className="mt-2 flex h-8 w-fit items-center gap-1.5 rounded-lg bg-gray-900 px-3 text-[11px] font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          <ShoppingCart size={12} />
          {item.outOfStock ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </div>
  );
};

/* ── WishlistSidebar ── */
const WishlistSidebar = ({ open, onOpenChange }) => {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const addToCart = useCartStore((s) => s.addItem);

  const handleAddToCart = (item) => {
    addToCart(item);
    removeItem(item._id);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[380px] p-0 flex flex-col [&>button]:hidden"
      >
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-gray-100 space-y-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-sm font-semibold text-gray-900 tracking-tight">
              Wishlist
              {items.length > 0 && (
                <span className="ml-2 text-[11px] font-normal text-gray-400">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              )}
            </SheetTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 divide-y divide-gray-100">
          {items.length === 0 ? (
            <EmptyWishlist />
          ) : (
            items.map((item) => (
              <WishlistRow
                key={item._id}
                item={item}
                onRemove={removeItem}
                onAddToCart={handleAddToCart}
              />
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="px-5 pt-4 pb-5 border-t border-gray-100">
            <Link
              to="/wishlist"
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-center w-full h-9 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              View full wishlist
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default WishlistSidebar;
