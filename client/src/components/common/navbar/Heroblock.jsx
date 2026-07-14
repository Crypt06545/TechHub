import React, { useRef } from "react";
import { ArrowRight, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

/* ─────────────────────────────────────────────────────────────────────
   Slide data — swap `image` for real product PNGs (transparent bg
   works best against the dark card)
───────────────────────────────────────────────────────────────────── */
const SLIDES = [
  {
    id: 1,
    badge: "New Arrival",
    titleLine1: "Powerful Tech.",
    titleLine2: "Endless Possibilities.",
    description:
      "Explore next-gen laptops and accessories built for speed, performance and style.",
    image: "/images/hero/laptop.png",
    ctaText: "Shop Now",
    ctaLink: "/products",
    accent: "text-orange-500",
    badgeBg: "bg-orange-600",
  },
  {
    id: 2,
    badge: "Best Seller",
    titleLine1: "Precision Meets",
    titleLine2: "Performance.",
    description:
      "High-refresh displays and desktop-class power in a body built to travel.",
    image: "/images/hero/pc-build.png",
    ctaText: "Explore Builds",
    ctaLink: "/pc-builder",
    accent: "text-blue-400",
    badgeBg: "bg-blue-600",
  },
  {
    id: 3,
    badge: "Limited Deal",
    titleLine1: "Sound That",
    titleLine2: "Moves You.",
    description: "Studio-grade audio gear, up to 40% off this week only.",
    image: "/images/hero/headphones.png",
    ctaText: "Shop Deals",
    ctaLink: "/deals",
    accent: "text-emerald-400",
    badgeBg: "bg-emerald-600",
  },
  {
    id: 4,
    badge: "Just Landed",
    titleLine1: "Capture Every",
    titleLine2: "Detail.",
    description:
      "Mirrorless bodies and glass for creators who don't compromise.",
    image: "/images/hero/camera.png",
    ctaText: "View Cameras",
    ctaLink: "/products?categories=Cameras",
    accent: "text-purple-400",
    badgeBg: "bg-purple-600",
  },
];

/* ─────────────────────────────────────────────────────────────────────
   HeroSlider
───────────────────────────────────────────────────────────────────── */
const HeroSlider = () => {
  const swiperRef = useRef(null);

  return (
    <div className="relative w-full flex-shrink-0 group/hero">
      <div className="w-full rounded-3xl overflow-hidden min-h-[320px] sm:min-h-[360px] lg:min-h-[400px]">
        <Swiper
          modules={[Autoplay, Pagination]}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          slidesPerView={1}
          loop
          speed={700}
          watchOverflow
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            el: ".hero-pagination",
            clickable: true,
            bulletClass: "hero-bullet",
            bulletActiveClass: "hero-bullet-active",
          }}
          className="w-full h-full"
        >
          {SLIDES.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="w-full h-full min-h-[320px] sm:min-h-[360px] lg:min-h-[400px] bg-[#0F1115] p-6 sm:p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
                {/* Product graphic */}
                <div className="absolute right-0 bottom-0 w-1/2 sm:w-[45%] h-full hidden md:flex items-center justify-center pointer-events-none">
                  <div className="relative w-full h-[85%] flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-2xl" />
                    {slide.image ? (
                      <img
                        src={slide.image}
                        alt={slide.titleLine1}
                        className="relative z-10 max-h-full max-w-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover/hero:scale-105"
                      />
                    ) : (
                      <span className="relative z-10 text-center p-4 text-gray-600 text-xs font-mono border border-white/5 rounded-2xl w-full h-full flex items-center justify-center">
                        [ Product Graphic ]
                      </span>
                    )}
                  </div>
                </div>

                {/* Copy */}
                <div className="z-10 max-w-xl">
                  <span
                    className={`${slide.badgeBg} text-[10px] lg:text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block`}
                  >
                    {slide.badge}
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mt-4 lg:mt-5 leading-tight">
                    {slide.titleLine1}
                    <br />
                    <span className={slide.accent}>{slide.titleLine2}</span>
                  </h2>
                  <p className="text-gray-400 mt-3 lg:mt-4 text-xs sm:text-sm font-normal max-w-xs sm:max-w-sm leading-relaxed hidden sm:block">
                    {slide.description}
                  </p>
                </div>

                {/* CTAs */}
                <div className="z-10 flex items-center gap-4 lg:gap-6 mt-6 sm:mt-8">
                  <a
                    href={slide.ctaLink}
                    className="bg-white text-black text-xs lg:text-sm font-bold px-5 lg:px-7 py-2.5 lg:py-3 rounded-xl hover:bg-orange-600 hover:text-white transition-all flex items-center gap-2 group/btn shadow-md"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight
                      size={16}
                      className="group-hover/btn:translate-x-1 transition-transform"
                    />
                  </a>
                  <button className="hidden sm:flex items-center gap-3 text-sm font-medium text-white hover:text-orange-400 transition-colors">
                    <span className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                      <Play size={14} fill="currentColor" className="ml-0.5" />
                    </span>
                    Watch Video
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Prev / Next arrows — desktop only, appear on hover */}
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          aria-label="Previous slide"
          className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover/hero:opacity-100 hover:bg-white/20 transition-all"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => swiperRef.current?.slideNext()}
          aria-label="Next slide"
          className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover/hero:opacity-100 hover:bg-white/20 transition-all"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Pagination dots — sits below the card, never overlaps content */}
      <div className="hero-pagination flex items-center justify-center gap-2 mt-4" />

      {/* Custom bullet styling — sits on light page background now, not the dark card */}
      <style>{`
        .hero-bullet {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: #d1d5db;
          display: inline-block;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .hero-bullet:hover {
          background: #9ca3af;
        }
        .hero-bullet-active {
          width: 22px;
          background: #ea580c;
        }
      `}</style>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   SubHeroBanners — unchanged
───────────────────────────────────────────────────────────────────── */
const SubHeroBanners = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
    {/* Smartphones */}
    <div className="bg-[#FFF4EE] hover:shadow-md transition-all rounded-2xl p-5 lg:p-6 min-h-[120px] flex items-center justify-between cursor-pointer group relative overflow-hidden">
      <div className="z-10 flex flex-col justify-between h-full py-0.5">
        <div>
          <span className="text-gray-500 text-[10px] lg:text-[11px] font-medium block">
            Top Deals on
          </span>
          <h3 className="font-bold text-[17px] lg:text-[19px] text-gray-900 leading-tight mt-0.5">
            Smartphones
          </h3>
          <p className="text-orange-600 text-xs font-semibold mt-1">
            Up to 30% Off
          </p>
        </div>
        <button className="bg-orange-600 text-white text-[10px] lg:text-[11px] font-bold px-3 py-1.5 rounded-lg w-20 lg:w-24 hover:bg-orange-700 transition-colors mt-2 shadow-sm">
          Shop Now
        </button>
      </div>
      <div className="w-24 lg:w-28 h-full absolute right-2 bottom-0 flex items-center justify-center font-bold text-xs text-orange-200">
        [Image]
      </div>
    </div>

    {/* Headphones */}
    <div className="bg-[#F3F9F6] hover:shadow-md transition-all rounded-2xl p-5 lg:p-6 min-h-[120px] flex items-center justify-between cursor-pointer group relative overflow-hidden">
      <div className="z-10 flex flex-col justify-between h-full py-0.5">
        <div>
          <span className="text-gray-500 text-[10px] lg:text-[11px] font-medium block">
            Immersive Sound
          </span>
          <h3 className="font-bold text-[17px] lg:text-[19px] text-gray-900 leading-tight mt-0.5">
            Headphones
          </h3>
          <p className="text-gray-600 text-xs font-semibold mt-1">
            From $59.00
          </p>
        </div>
        <button className="bg-black text-white text-[10px] lg:text-[11px] font-bold px-3 py-1.5 rounded-lg w-20 lg:w-24 hover:bg-emerald-600 transition-colors mt-2 shadow-sm">
          Shop Now
        </button>
      </div>
      <div className="w-24 lg:w-28 h-full absolute right-2 bottom-0 flex items-center justify-center font-bold text-xs text-emerald-200">
        [Image]
      </div>
    </div>

    {/* Wearables */}
    <div className="bg-[#EEF4FF] hover:shadow-md transition-all rounded-2xl p-5 lg:p-6 min-h-[120px] sm:col-span-2 xl:col-span-1 flex items-center justify-between cursor-pointer group relative overflow-hidden">
      <div className="z-10 flex flex-col justify-between h-full py-0.5">
        <div>
          <span className="text-gray-500 text-[10px] lg:text-[11px] font-medium block">
            Smart Living
          </span>
          <h3 className="font-bold text-[17px] lg:text-[19px] text-gray-900 leading-tight mt-0.5">
            Wearables
          </h3>
          <p className="text-blue-600 text-xs font-semibold mt-1">
            Up to 25% Off
          </p>
        </div>
        <button className="bg-blue-600 text-white text-[10px] lg:text-[11px] font-bold px-3 py-1.5 rounded-lg w-20 lg:w-24 hover:bg-blue-700 transition-colors mt-2 shadow-sm">
          Shop Now
        </button>
      </div>
      <div className="w-24 lg:w-28 h-full absolute right-2 bottom-0 flex items-center justify-center font-bold text-xs text-blue-200">
        [Image]
      </div>
    </div>
  </div>
);

const HeroBlock = () => (
  <div className="flex-1 w-full min-w-0 flex flex-col gap-4">
    <HeroSlider />
    <SubHeroBanners />
  </div>
);

export default HeroBlock;
