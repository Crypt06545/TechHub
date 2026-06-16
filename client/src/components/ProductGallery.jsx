import { useState, useRef, useCallback } from "react";
import gsap from "gsap";

export const ProductGallery = ({ images, title }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const imgRef = useRef(null);

  // GSAP smooth fade+slide on image change
  const changeImage = useCallback((index) => {
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
          { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
        );
      },
    });
  }, [selectedImage]);

  // Fallback if no images are provided
  if (!images || images.length === 0) {
    return <div className="aspect-[4/3] rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center">No Image Available</div>;
  }

  return (
    <div>
      {/* Main Image */}
      <div className="aspect-[4/3] rounded-xl border border-gray-100 bg-gray-50 overflow-hidden mb-3 flex items-center justify-center">
        <img
          ref={imgRef}
          src={images[selectedImage]?.url}
          alt={title}
          className="w-full h-full object-contain p-4"
        />
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
            <img src={img.url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-contain p-1" />
          </button>
        ))}
      </div>
    </div>
  );
};
