import { NAV_LINKS } from "./NavData";

// Each link gets its own GSAP hover animation via delegated handlers passed in
// from the parent (which owns the contextSafe scope).
const NavLinks = ({ onMouseEnter, onMouseLeave }) => (
  <div className="hidden sticky top-0 z-50 lg:flex items-center justify-start border-t border-gray-100 py-3 h-12 overflow-hidden">
    <nav className="flex items-center gap-8">
      {NAV_LINKS.map((link, idx) => (
        <div
          key={idx}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="relative cursor-pointer h-6 overflow-hidden group/link"
        >
          <span
            className={`nav-primary block text-[14px] font-bold tracking-wide transform will-change-transform ${
              idx === 0 ? "text-orange-600" : "text-gray-700"
            }`}
          >
            {link}
            {idx === 0 && (
              <span className="absolute bottom-0 left-0 w-4 h-[2px] bg-orange-600 rounded-full" />
            )}
          </span>
          <span className="nav-secondary block text-[14px] font-bold tracking-wide text-orange-600 absolute top-full left-0 transform will-change-transform">
            {link}
          </span>
        </div>
      ))}
    </nav>
  </div>
);

export default NavLinks;
