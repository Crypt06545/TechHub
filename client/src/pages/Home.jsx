import HeroBlock from "@/components/common/navbar/Heroblock";
import MegaMenuSidebar from "@/components/common/navbar/Megamenusidebar";
import StoreFeatures from "@/components/common/navbar/Storefeatures";
import FeaturedProducts from "@/components/FeaturedProducts";
import HomeCategories from "@/components/HomeCategories";


const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero — sidebar megamenu + banners + trust badges */}
      <div className="bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex gap-6 py-6 items-start min-w-0">
            <MegaMenuSidebar />
            <HeroBlock />
          </div>
          <StoreFeatures />
        </div>
      </div>

      {/* Rest of home page */}
      <HomeCategories />
      <FeaturedProducts />
      {/* <AddProduct />
      <CheckoutPage /> */}
    </div>
  );
};

export default Home;
