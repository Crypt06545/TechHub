import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, ArrowUpRight } from "lucide-react";

import ZUHR from "@/assets/logo.png";

import Bkash from "@/assets/bkash-footer.svg";
import Nagad from "@/assets/nagad-footer.svg";
import CashOnDelevary from "@/assets/cashdelevary.svg";

import FaceBook from "@/assets/facebooksvg.svg";
import Insta from "@/assets/instagramsvg.svg";

// Collections
const collections = [
  { label: "Oud Collection", to: "/collections/oud" },
  { label: "Musk Collection", to: "/collections/musk" },
  { label: "Amber Collection", to: "/collections/amber" },
];

// Shop
const shopLinks = [
  { label: "All Fragrances", to: "/shop" },
  { label: "Best Sellers", to: "/shop?sort=popular" },
  { label: "Gift Sets", to: "/shop/gift-sets" },
  { label: "New Arrivals", to: "/shop?sort=newest" },
];

// Support
const supportLinks = [
  { label: "Track Order", to: "/orders/track" },
  { label: "Shipping & Delivery", to: "/shipping" },
  { label: "Return Policy", to: "/returns" },
  { label: "Contact Us", to: "/contact" },
  { label: "After Sales Policy", to: "/after-sales-policy" },
];

const Footer = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-200 border-t border-zinc-900 pb-[80px] md:pb-0">
      <div className="container mx-auto px-4 py-12">
        {/* ================= ORNAMENTAL DIVIDER ================= */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className="h-px w-16 bg-zinc-800" />

          <span className="h-2 w-2 rotate-45 border border-zinc-700" />

          <span className="h-px w-16 bg-zinc-800" />
        </div>

        {/* ================= MAIN FOOTER ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr] gap-10 pb-10 border-b border-zinc-900">
          {/* ================= BRAND ================= */}
          <div>
            <Link to="/" className="inline-block -ml-1" aria-label="ZUHR Home">
              <img
                src={ZUHR}
                alt="ZUHR"
                className="h-20 lg:h-24 w-auto object-contain brightness-0 invert"
              />
            </Link>

            <p className="mt-4 text-sm leading-relaxed max-w-xs text-zinc-400">
              Luxury oil perfumes crafted in small batches — alcohol-free attars
              made for warmer air and longer evenings, worn across Bangladesh.
            </p>

            {/* Location */}
            <div className="flex items-center gap-2 mt-5 text-sm text-zinc-400">
              <MapPin className="h-4 w-4 shrink-0 text-zinc-500" />
              <span>Bogura, Bangladesh</span>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-3 mt-6">
              {/* Facebook */}
              <a
                href="https://facebook.com/ZUHRBD"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ZUHR on Facebook"
                className="group h-10 w-10 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-950 hover:bg-white hover:border-white transition-all duration-300"
              >
                <img
                  src={FaceBook}
                  alt="Facebook"
                  className="h-4 w-4 object-contain brightness-0 invert opacity-70 group-hover:invert-0 group-hover:opacity-100 transition-all duration-300"
                />
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/zuhr.bd"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ZUHR on Instagram"
                className="group h-10 w-10 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-950 hover:bg-white hover:border-white transition-all duration-300"
              >
                <img
                  src={Insta}
                  alt="Instagram"
                  className="h-4 w-4 object-contain brightness-0 invert opacity-70 group-hover:invert-0 group-hover:opacity-100 transition-all duration-300"
                />
              </a>
            </div>
          </div>

          {/* ================= COLLECTIONS ================= */}
          <div>
            <h3 className="text-xs font-semibold text-white tracking-[0.18em] uppercase mb-5">
              Collections
            </h3>

            <ul className="space-y-3.5 text-sm">
              {collections.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="group inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                  >
                    <span>{item.label}</span>

                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-[-3px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= SHOP ================= */}
          <div>
            <h3 className="text-xs font-semibold text-white tracking-[0.18em] uppercase mb-5">
              Shop
            </h3>

            <ul className="space-y-3.5 text-sm">
              {shopLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="group inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                  >
                    <span>{item.label}</span>

                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-[-3px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= SUPPORT + NEWSLETTER ================= */}
          <div>
            <h3 className="text-xs font-semibold text-white tracking-[0.18em] uppercase mb-5">
              Support
            </h3>

            <ul className="space-y-3.5 text-sm mb-7">
              {supportLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="group inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                  >
                    <span>{item.label}</span>

                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-[-3px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <h3 className="text-xs font-semibold text-white tracking-[0.18em] uppercase mb-3">
              New fragrance drops
            </h3>

            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Your email"
                className="h-10 bg-transparent border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600 focus-visible:border-zinc-600"
              />

              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 bg-white hover:bg-zinc-200 text-zinc-950 shrink-0 font-bold"
                aria-label="Subscribe"
              >
                →
              </Button>
            </form>
          </div>
        </div>

        {/* ================= BOTTOM BAR ================= */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-7 text-xs text-zinc-500">
          {/* Copyright */}
          <p className="order-3 lg:order-1">
            © {new Date().getFullYear()} ZUHR. Crafted in Bangladesh.
          </p>

          {/* Payment Methods */}
          <div className="order-1 lg:order-2 flex items-center gap-3">
            <span className="text-zinc-500 mr-1">We accept</span>

            <div className="flex items-center gap-2">
              {/* Cash on Delivery */}
              <div
                className="h-10 min-w-[64px] px-3 rounded-md border border-zinc-800 bg-white flex items-center justify-center hover:border-zinc-700 transition-colors"
                title="Cash on Delivery"
              >
                <img
                  src={CashOnDelevary}
                  alt="Cash on Delivery"
                  className="h-6 w-auto max-w-[52px] object-contain"
                />
              </div>

              {/* bKash */}
              <div
                className="h-9 min-w-[52px] px-2.5 rounded-md border border-zinc-800 bg-white flex items-center justify-center hover:border-zinc-700 transition-colors"
                title="bKash"
              >
                <img
                  src={Bkash}
                  alt="bKash"
                  className="max-h-5 w-auto object-contain"
                />
              </div>

              {/* Nagad */}
              <div
                className="h-9 min-w-[52px] px-2.5 rounded-md border border-zinc-800 bg-white flex items-center justify-center hover:border-zinc-700 transition-colors"
                title="Nagad"
              >
                <img
                  src={Nagad}
                  alt="Nagad"
                  className="max-h-5 w-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Legal */}
          <div className="order-2 lg:order-3 flex items-center gap-5">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>

            <span className="h-3 w-px bg-zinc-800" />

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
