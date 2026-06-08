import { productService } from "../services/productService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getProductController = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || "20", 10), 50);

  const data = await productService.getProducts({
    limit,
    cursor: req.query.cursor,
    category: req.query.category,
    featured: req.query.featured,
    search: req.query.search,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Products fetched successfully"));
});

export const getFeaturedProductConroller = asyncHandler(async (req, res) => {
  const products = await productService.getFeaturedProducts();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { products, total: products.length },
        "Featured products fetched successfully",
      ),
    );
});

export const getSingleProductController = asyncHandler(async (req, res) => {
  const product = await productService.getSingleProduct(req.params.slug);

  return res
    .status(200)
    .json(new ApiResponse(200, { product }, "Product fetched successfully"));
});
