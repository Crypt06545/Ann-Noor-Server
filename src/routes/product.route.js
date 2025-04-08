import { Router } from "express";
import { adminOnly, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  prodcutDetails,
  updateProduct,
} from "../../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const productRouter = Router();

productRouter.route("/product-details/:id").get(prodcutDetails);

// secure routes
productRouter.route("/all-products").get(verifyJWT, adminOnly, getAllProducts);
productRouter
  .route("/create-product")
  .post(
    upload.fields([{ name: "images", maxCount: 5 }]),
    verifyJWT,
    adminOnly,
    createProduct
  );
productRouter
  .route("/delete-product/:id")
  .delete(verifyJWT, adminOnly, deleteProduct);

productRouter
  .route("/update-product/:id")
  .put(verifyJWT, adminOnly, updateProduct);

export default productRouter;
