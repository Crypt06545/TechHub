import { NavLink } from "react-router-dom";
import { NAV_LINKS } from "./NavData";

const NavLinks = () => {
  return (
    <nav className="flex items-center gap-8 py-3 h-12 overflow-hidden">
      {NAV_LINKS.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          end={link.path === "/"}
          className="relative h-6 overflow-hidden group"
        >
          {({ isActive }) => (
            <>
              {/* Normal Text */}
              <span
                className={`block text-[14px] font-bold tracking-wide transition-transform duration-200 group-hover:-translate-y-full ${
                  isActive ? "text-orange-600" : "text-gray-700"
                }`}
              >
                {link.name}
              </span>

              {/* Hover Text */}
              <span
                className={`absolute top-full left-0 block text-[14px] font-bold tracking-wide transition-transform duration-200 group-hover:-translate-y-full ${
                  isActive ? "text-orange-600" : "text-orange-600"
                }`}
              >
                {link.name}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default NavLinks;
