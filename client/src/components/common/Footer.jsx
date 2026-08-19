import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ZUHR from "@/assets/logo.png";

// ASSUMPTION: placeholder collection names — swap for your real ZUHR lines
const collections = [
  { label: "Oud Collection", to: "/collections/oud" },
  { label: "Musk Collection", to: "/collections/musk" },
  { label: "Amber Collection", to: "/collections/amber" },
];

const shopLinks = [
  { label: "All Fragrances", to: "/shop" },
  { label: "Best Sellers", to: "/shop?sort=popular" },
  { label: "Gift Sets", to: "/shop/gift-sets" },
  { label: "New Arrivals", to: "/shop?sort=newest" },
];

// ASSUMPTION: swapped the raw Facebook link for a proper /contact route —
// a dedicated support link should land on your own page, not an external one
const supportLinks = [
  { label: "Track Order", to: "/orders/track" },
  { label: "Shipping & Delivery", to: "/shipping" },
  { label: "Return Policy", to: "/returns" },
  { label: "Contact Us", to: "/contact" },
  { label: "After Sales Policy", to: "/after-sales-policy" },
];

const Footer = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-200 border-t border-zinc-900">
      <div className="container mx-auto px-4 py-12">
        {/* Ornamental divider */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className="h-px w-16 bg-zinc-800" />
          <span className="h-2 w-2 rotate-45 border border-zinc-700" />
          <span className="h-px w-16 bg-zinc-800" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr] gap-10 pb-10 border-b border-zinc-900">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block -ml-1">
              <img
                src={ZUHR}
                alt="ZUHR"
                className="h-20 lg:h-24 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed max-w-xs text-zinc-300">
              Luxury oil perfumes crafted in small batches — alcohol-free attars
              made for warmer air and longer evenings, worn across Bangladesh.
            </p>

            <div className="flex items-center gap-2 mt-5 text-sm text-zinc-300">
              <span className="text-xs text-zinc-400 font-bold">[📍]</span>
              <span>Bogura, Bangladesh</span>
            </div>

            {/* Social Icons — ASSUMPTION: placeholder handles, update to your real ones */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://facebook.com/ZUHRBD"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ZUHR on Facebook"
                className="h-9 w-9 text-xs rounded-full border border-zinc-700 flex items-center justify-center text-zinc-300 hover:border-white hover:text-white hover:bg-zinc-900 transition-colors"
              >
                FB
              </a>

              <a
                href="https://instagram.com/zuhrbd"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ZUHR on Instagram"
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
                  <Link
                    to={item.to}
                    className="hover:text-white hover:underline decoration-zinc-600 underline-offset-4 transition-all"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-sm font-semibold text-white tracking-wide uppercase mb-3">
              New fragrance drops
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
          <p>© {new Date().getFullYear()} ZUHR. Crafted in Bangladesh.</p>
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
