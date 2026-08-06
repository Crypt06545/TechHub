import HeroBlock from "@/components/common/navbar/Heroblock";
import MegaMenuSidebar from "@/components/common/navbar/Megamenusidebar";
import StoreFeatures from "@/components/common/navbar/Storefeatures";
// import FeaturedProducts from "@/components/FeaturedProducts";
import HomeCategories from "@/components/HomeCategories";
import NewArrival from "@/components/NewArrival";
import ProductSection from "@/components/products/Productsection";


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
      {/* <FeaturedProducts /> */}
      <ProductSection
        section="featured"
        title="Featured Products"
        subtitle="Our top picks and trending devices selected just for you."
      />
      <ProductSection
        section="Hot Deal"
        title="Hot Deals"
        subtitle="Grab these deals before they're gone."
      />

      <ProductSection
        section="New Arrival"
        title="New Arrivals"
        subtitle="Fresh stock, just landed."
      />

      <ProductSection
        section="Best Seller"
        title="Best Sellers"
        subtitle="Customer favorites, tried and tested."
      />

      {/* <ManageProductCost/> */}
    </div>
  );
};

export default Home;
