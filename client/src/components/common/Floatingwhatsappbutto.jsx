import { useState } from "react";

const WHATSAPP_NUMBER = "8801719550746"; // country code + number, no + or spaces
const DEFAULT_MESSAGE = "Hi ZUHR, I have a question about a product.";

const WhatsAppIcon = ({ size = 28 }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16.001 2.667c-7.364 0-13.334 5.97-13.334 13.334 0 2.353.615 4.66 1.784 6.687L2.667 29.333l6.826-1.79a13.27 13.27 0 0 0 6.508 1.658h.006c7.363 0 13.333-5.97 13.333-13.334 0-3.562-1.387-6.912-3.906-9.431a13.246 13.246 0 0 0-9.433-3.769Zm0 24.4h-.005a11.06 11.06 0 0 1-5.634-1.543l-.404-.24-4.05 1.062 1.082-3.949-.264-.406a11.045 11.045 0 0 1-1.694-5.89c0-6.11 4.972-11.083 11.075-11.083a11 11 0 0 1 7.834 3.253 11.007 11.007 0 0 1 3.242 7.838c0 6.11-4.972 11.083-11.077 11.083Zm6.076-8.297c-.333-.167-1.966-.97-2.271-1.08-.305-.112-.527-.167-.75.166-.222.334-.86 1.08-1.055 1.303-.194.223-.388.25-.72.084-.334-.167-1.409-.52-2.684-1.657-.992-.885-1.663-1.978-1.858-2.312-.194-.334-.02-.514.147-.68.15-.15.334-.39.5-.585.167-.195.223-.334.334-.556.111-.223.056-.418-.028-.585-.083-.167-.75-1.807-1.028-2.474-.27-.65-.545-.562-.75-.573l-.638-.011c-.222 0-.583.083-.888.417-.305.334-1.166 1.14-1.166 2.78 0 1.64 1.194 3.225 1.36 3.447.167.223 2.352 3.591 5.699 5.036.796.344 1.417.55 1.901.703.799.254 1.526.218 2.101.132.641-.096 1.966-.804 2.244-1.581.278-.777.278-1.443.194-1.582-.083-.14-.305-.223-.638-.39Z" />
  </svg>
);

const FloatingWhatsAppButton = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed bottom-[92px] right-6 z-50 flex items-center gap-3">
      {/* Tooltip */}
      <div
        className={`hidden sm:block whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white shadow-lg transition-all duration-200 ${
          showTooltip
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-2 pointer-events-none"
        }`}
      >
        Chat on WhatsApp
      </div>

      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Chat on WhatsApp"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-110 hover:bg-[#20bd5a] border-0 cursor-pointer"
      >
        {/* pulse ring to draw attention */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40" />
        <WhatsAppIcon size={26} />
      </button>
    </div>
  );
};

export default FloatingWhatsAppButton;
