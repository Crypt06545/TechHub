import { useState } from "react";

const MESSENGER_PAGE_USERNAME = "yourpageusername"; // your Facebook Page username, from m.me/<username>

const MessengerIcon = ({ size = 26 }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient
        id="messenger-gradient"
        x1="0%"
        y1="100%"
        x2="100%"
        y2="0%"
      >
        <stop offset="0%" stopColor="#0099FF" />
        <stop offset="60%" stopColor="#A033FF" />
        <stop offset="100%" stopColor="#FF5280" />
      </linearGradient>
    </defs>
    <path
      fill="url(#messenger-gradient)"
      d="M16 2.667C8.462 2.667 2.667 8.128 2.667 15.407c0 3.914 1.69 7.302 4.44 9.638v4.288l4.056-2.226a13.98 13.98 0 0 0 4.837.857c7.538 0 13.333-5.461 13.333-12.74C29.333 8.128 23.538 2.667 16 2.667Z"
    />
    <path
      fill="#fff"
      d="m8.667 19.556 4.037-4.278 4.148 3.222 4.481-4.278-4.037 5.611-4.148-3.222-4.481 4.945Z"
    />
  </svg>
);

const FloatingMessengerButton = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    const url = `https://m.me/${MESSENGER_PAGE_USERNAME}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed bottom-[160px] right-6 z-50 flex items-center gap-3">
      {/* Tooltip */}
      <div
        className={`hidden sm:block whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white shadow-lg transition-all duration-200 ${
          showTooltip
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-2 pointer-events-none"
        }`}
      >
        Message us on Messenger
      </div>

      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Message us on Messenger"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-white shadow-lg transition-transform duration-200 hover:scale-110 border-0 cursor-pointer"
      >
        <MessengerIcon size={30} />
      </button>
    </div>
  );
};

export default FloatingMessengerButton;
