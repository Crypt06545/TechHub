import { useProductDetails } from "@/hooks/useProducts";
import { useParams } from "react-router-dom";

const ProductDetails = () => {
  const { slug } = useParams();
  console.log(slug);
  // 1. Call the hook and destructure the state variables
  const { data, isLoading, isError, error } = useProductDetails(slug);

  // 2. Handle loading and error states gracefully
  if (isLoading) {
    return <div className="text-center py-10">Loading product details...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-10">Product not found.</div>;
  }
  console.log(data.data.product);

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6 text-gray-600 border">
      <div>
        {/* HomeDigital & ElectronicLaptop & ComputerApple MacBook Pro 16-inch 16GB 512GB  at fisrt this type if breadcrumb*/}
      </div>
      {/* this a full card  */}
      <div>
        {/* left side  */}
        <div>{/* product image */}</div>
        {/* down  */}
        {/* product sub image 4-5 based on api also chooose clickable  */}

        {/* right side  */}
        <div>
          <div>{/* product name | ratings | sku*/}</div>
          <div>{/* price and desc of products */}</div>
          <div>
            {/* quantuty increase buttona and alos decrase side add to cart */}
            {/* bellow buy now button */}

            {/* then this type of things
            Add to wishlist
Share
 Add to compare
 Estimate delivery times: 12-26 days (International).
 Return within 30 days of purchase. Taxes are non-refundable.
Availability:Only 8 left in stock

Category:Laptop & Computer
Tag:Digital & Electronic
Brands: Apple
            */}
          </div>
        </div>
      </div>

      <div>{/* then realted products  */}</div>
    </div>
  );
};

export default ProductDetails;
