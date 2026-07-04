import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const collections = [
  { label: "Senzo Oud", to: "/collections/oud" },
  { label: "Senzo Air", to: "/collections/air" },
  { label: "Senzo Sound", to: "/collections/sound" },
];

const shopLinks = [
  { label: "All Fragrances", to: "/shop" },
  { label: "Best Sellers", to: "/shop?sort=popular" },
  { label: "Gift Sets", to: "/shop/gift-sets" },
  { label: "New Arrivals", to: "/shop?sort=newest" },
];

const supportLinks = [
  { label: "Track Order", to: "/orders/track" },
  { label: "Shipping & Delivery", to: "/shipping" },
  { label: "Return Policy", to: "/returns" },
  { label: "Contact Us", to: "https://facebook.com/SenzoBD" },
];

const Footer = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-200 border-t border-zinc-900">
      <div className="max-w-[1300px] mx-auto px-6 lg:px-10 pt-16 pb-10">
        {/* Ornamental divider */}
        <div className="flex items-center justify-center gap-3 mb-14">
          <span className="h-px w-16 bg-zinc-800" />
          <span className="h-2 w-2 rotate-45 border border-zinc-700" />
          <span className="h-px w-16 bg-zinc-800" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr] gap-10 pb-12 border-b border-zinc-900">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block">
              <span className="text-3xl tracking-wide text-white font-bold font-serif">
                Senzo
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed max-w-xs text-zinc-300">
              Fragrance made for warmer air and longer evenings — crafted in
              small batches, worn across Bangladesh.
            </p>

            {/* MapPin Placeholder */}
            <div className="flex items-center gap-2 mt-5 text-sm text-zinc-300">
              <span className="text-xs text-zinc-400 font-bold">[📍]</span>
              <span>Bogura, Bangladesh</span>
            </div>

            {/* Social Icons Placeholders */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://facebook.com/SenzoBD"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Senzo on Facebook"
                className="h-9 w-9 text-xs rounded-full border border-zinc-700 flex items-center justify-center text-zinc-300 hover:border-white hover:text-white hover:bg-zinc-900 transition-colors"
              >
                FB
              </a>

              <a
                href="https://instagram.com/senzobd"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Senzo on Instagram"
                className="h-9 w-9 text-xs rounded-full border border-zinc-700 flex items-center justify-center text-zinc-300 hover:border-white hover:text-white hover:bg-zinc-900 transition-colors"
              >
                IG
              </a>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase mb-4">
              Collections
            </h3>
            <ul className="space-y-3 text-sm">
              {collections.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="hover:text-white hover:underline decoration-zinc-600 underline-offset-4 transition-all"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase mb-4">
              Shop
            </h3>
            <ul className="space-y-3 text-sm">
              {shopLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="hover:text-white hover:underline decoration-zinc-600 underline-offset-4 transition-all"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support + Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-3 text-sm mb-6">
              {supportLinks.map((item) => (
                <li key={item.label}>
                  {item.to.startsWith("http") ? (
                    <a
                      href={item.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white hover:underline decoration-zinc-600 underline-offset-4 transition-all"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.to}
                      className="hover:text-white hover:underline decoration-zinc-600 underline-offset-4 transition-all"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <h3 className="text-sm font-semibold text-white tracking-wide uppercase mb-3">
              New blend drops
            </h3>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Your email"
                className="bg-transparent border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-500"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-white hover:bg-zinc-200 text-zinc-950 shrink-0 font-bold"
                aria-label="Subscribe"
              >
                →
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} Senzo. Crafted in Bangladesh.</p>
          <div className="flex items-center gap-3 text-zinc-300">
            <span>Cash on Delivery</span>
            <span className="text-zinc-700">·</span>
            <span>bKash</span>
            <span className="text-zinc-700">·</span>
            <span>Nagad</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
