import { useState, useRef, useCallback } from "react";
import gsap from "gsap";
import { ZoomIn } from "lucide-react";

const LENS_SIZE = 220; // px — Amazon/Daraz-style professional lens size
const ZOOM_LEVEL = 2.2; // sweet spot: visible zoom without pixelation

export const ProductGallery = ({ images, title }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [bgPos, setBgPos] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  // GSAP smooth fade+slide on image change
  const changeImage = useCallback(
    (index) => {
      if (index === selectedImage) return;
      const el = imgRef.current;
      if (!el) return;

      gsap.to(el, {
        opacity: 0,
        y: 6,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => {
          setSelectedImage(index);
          gsap.fromTo(
            el,
            { opacity: 0, y: -6 },
            { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" },
          );
        },
      });
    },
    [selectedImage],
  );

  // Moves the lens box with the cursor and computes the zoomed background offset for it
  const handleMouseMove = useCallback((e) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const { width, height } = rect;
    setContainerSize({ width, height });

    // Raw cursor position inside the container, clamped only to the container's own bounds
    const rawX = Math.min(Math.max(e.clientX - rect.left, 0), width);
    const rawY = Math.min(Math.max(e.clientY - rect.top, 0), height);

    // Lens box position — clamped so the box itself stays fully inside the container
    const half = LENS_SIZE / 2;
    const lensX = Math.min(Math.max(rawX, half), width - half) - half;
    const lensY = Math.min(Math.max(rawY, half), height - half) - half;
    setLensPos({ x: lensX, y: lensY });

    // Zoomed background offset — calculated independently in px, using the RAW cursor
    // position, then clamped against the zoomed image's own bounds. This is what lets
    // every corner/edge of the image become visible, not just the clamped lens range.
    const zoomedWidth = width * ZOOM_LEVEL;
    const zoomedHeight = height * ZOOM_LEVEL;

    let bgX = -(rawX * ZOOM_LEVEL - LENS_SIZE / 2);
    let bgY = -(rawY * ZOOM_LEVEL - LENS_SIZE / 2);

    bgX = Math.min(0, Math.max(bgX, -(zoomedWidth - LENS_SIZE)));
    bgY = Math.min(0, Math.max(bgY, -(zoomedHeight - LENS_SIZE)));

    setBgPos({ x: bgX, y: bgY });
  }, []);

  // Fallback if no images are provided
  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/3] rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center">
        No Image Available
      </div>
    );
  }

  return (
    <div>
      {/* Main Image */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
        className="relative aspect-[4/3] rounded-xl border border-gray-100 bg-gray-50 overflow-hidden mb-3 flex items-center justify-center cursor-zoom-in"
      >
        <img
          ref={imgRef}
          src={images[selectedImage]?.url}
          alt={title}
          className="w-full h-full object-contain p-4"
        />

        {/* Square lens box — shows the magnified image INSIDE itself, full edge-to-edge coverage */}
        {isZooming && (
          <div
            className="pointer-events-none absolute overflow-hidden rounded-md border-2 border-gray-900/70 shadow-xl ring-1 ring-black/5"
            style={{
              width: LENS_SIZE,
              height: LENS_SIZE,
              left: lensPos.x,
              top: lensPos.y,
              backgroundImage: `url(${images[selectedImage]?.url})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${containerSize.width * ZOOM_LEVEL}px ${containerSize.height * ZOOM_LEVEL}px`,
              backgroundPosition: `${bgPos.x}px ${bgPos.y}px`,
            }}
          />
        )}

        {/* Zoom hint icon — visible until hover starts */}
        <div
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition-opacity duration-150 ${
            isZooming ? "opacity-0" : "opacity-100"
          }`}
        >
          <ZoomIn className="h-4 w-4 text-gray-600" />
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((img, i) => (
          <button
            key={img.publicId || i}
            onClick={() => changeImage(i)}
            className={`w-16 h-16 rounded-lg border-2 overflow-hidden bg-gray-50 transition-colors flex-shrink-0 ${
              selectedImage === i
                ? "border-gray-900"
                : "border-gray-100 hover:border-gray-300"
            }`}
          >
            <img
              src={img.url}
              alt={`Thumbnail ${i + 1}`}
              className="w-full h-full object-contain p-1"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
