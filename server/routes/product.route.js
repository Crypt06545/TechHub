import { Router } from "express";
import {
  getProductController,
  getProductFiltersController,
  getProductSectionController,
  getSingleProductController,
} from "../controllers/product.contoller.js";
import { getAllCategoryController } from "../controllers/admin.controller.js";

const productRouter = Router();

// Public Route - Anyone can access
productRouter.get("/", getProductController);
productRouter.get("/categories", getAllCategoryController);
productRouter.get("/filters", getProductFiltersController);
productRouter.get("/section/:type", getProductSectionController);

productRouter.get("/:slug", getSingleProductController);

export default productRouter;
