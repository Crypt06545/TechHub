import { NAV_LINKS } from "./NavData";

const NavLinks = () => (
  <nav className="flex items-center gap-8 py-3 h-12 overflow-hidden">
    {NAV_LINKS.map((link, idx) => (
      <div
        key={idx}
        className="relative cursor-pointer h-6 overflow-hidden group"
      >
        <span
          className={`block text-[14px] font-bold tracking-wide transition-transform duration-200 group-hover:-translate-y-full ${
            idx === 0 ? "text-orange-600" : "text-gray-700"
          }`}
        >
          {link}
        </span>
        <span className="block text-[14px] font-bold tracking-wide text-orange-600 absolute top-full left-0 transition-transform duration-200 group-hover:-translate-y-full">
          {link}
        </span>
      </div>
    ))}
  </nav>
);

export default NavLinks;
