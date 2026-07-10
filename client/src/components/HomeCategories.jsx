import { ChartArea, FileQuestion, Laptop, Settings } from "lucide-react";
import React from "react";
import Title from "./Title";
import { Link } from "react-router-dom";

// --- Electronics category images (TechHub) — commented out, restore if needed ---
// import tv from "@/assets/tv-48x48.png";
// import trimmer from "@/assets/trimmer-48x48.png";
// import tablet from "@/assets/tablet-48x48.png";
// import smartWatch from "@/assets/smart-watch-48x48.png";
// import router from "@/assets/router-50x50.png";
// import refigerator from "@/assets/refrigerator-48x48.png";
// import powerstation from "@/assets/powerstation-48x48.png";
// import portablessd from "@/assets/portable-ssd-48x48.png";
// import gamingchair from "@/assets/gaming-char-50x50.png";
// import drone from "@/assets/drone-48x48.png";
// import cpucooler from "@/assets/cpu-cooler-50x50.png";
// import ac from "@/assets/ac-48x48.png";
// import earbuds from "@/assets/earbuds-48x48.png";
// import gimble from "@/assets/gimbal-48x48.png";

// --- Attar category images (Senzo) ---
import men from "@/assets/men-48x48.png";
import women from "@/assets/women-48x48.png";
import unisex from "@/assets/unisex-48x48.png";
import oud from "@/assets/oud-48x48.png";

const categories = [
  // --- Electronics categories (TechHub) — commented out, restore if needed ---
  // { _id: "1", title: "TV", image: tv, slug: { current: "tv" } },
  // { _id: "2", title: "Trimmer", image: trimmer, slug: { current: "trimmer" } },
  // { _id: "3", title: "Tablet", image: tablet, slug: { current: "tablet" } },
  // { _id: "4", title: "Smart Watch", image: smartWatch, slug: { current: "smart-watch" } },
  // { _id: "5", title: "Router", image: router, slug: { current: "router" } },
  // { _id: "6", title: "Refrigerator", image: refigerator, slug: { current: "refrigerator" } },
  // { _id: "7", title: "Power Station", image: powerstation, slug: { current: "power-station" } },
  // { _id: "8", title: "Portable SSD", image: portablessd, slug: { current: "portable-ssd" } },
  // { _id: "9", title: "Gaming Chair", image: gamingchair, slug: { current: "gaming-chair" } },
  // { _id: "10", title: "Drone", image: drone, slug: { current: "drone" } },
  // { _id: "11", title: "CPU Cooler", image: cpucooler, slug: { current: "cpu-cooler" } },
  // { _id: "12", title: "AC", image: ac, slug: { current: "ac" } },
  // { _id: "13", title: "Earbuds", image: earbuds, slug: { current: "earbuds" } },
  // { _id: "14", title: "Gimbal", image: gimble, slug: { current: "gimbal" } },

  { _id: "1", title: "Men", image: men, slug: { current: "men" } },
  { _id: "2", title: "Women", image: women, slug: { current: "women" } },
  { _id: "3", title: "Unisex", image: unisex, slug: { current: "unisex" } },
  { _id: "4", title: "Oud", image: oud, slug: { current: "oud" } },
];

const data = [
  {
    id: 1,
    title: "Laptop",
    description: "Find your laptop",
    icon: <Laptop className="w-5 h-5 md:w-6 md:h-6" />,
  },
  {
    id: 2,
    title: "Compare",
    description: "Compare products",
    icon: <ChartArea className="w-5 h-5 md:w-6 md:h-6" />,
  },
  {
    id: 3,
    title: "Help",
    description: "Got questions?",
    icon: <FileQuestion className="w-5 h-5 md:w-6 md:h-6" />,
  },
  {
    id: 4,
    title: "Settings",
    description: "Manage your account",
    icon: <Settings className="w-5 h-5 md:w-6 md:h-6" />,
  },
];

const HomeCategories = () => {
  return (
    <div className="container mx-auto mt-10 p-4 lg:mt-20">
      {/* category */}
      <div className="text-center space-y-1.5 mb-5 md:mb-10">
        <Title>Shop by Category</Title>
        <p>Find your perfect attar from our curated categories!</p>
        <div className="mt-5 grid grid-cols-4 md:grid-cols-8 gap-2.5">
          {categories?.map((category) => (
            <Link
              to={`/category/${category?.slug?.current}`}
              key={category?._id}
              className="bg-white p-5 flex flex-col items-center gap-3 rounded-lg border border-transparent hover:border-orange-700"
            >
              {category?.image && (
                <div className="w-16 h-16 md:w-20 md:h-20 overflow-hidden">
                  <img
                    src={category?.image}
                    alt={category?.title}
                    width={500}
                    height={500}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <p className="text-xs md:text-sm font-semibold text-center line-clamp-1">
                {category?.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeCategories;
