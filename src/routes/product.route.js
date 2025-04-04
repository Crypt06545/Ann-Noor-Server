import { Router } from "express";
import { adminOnly, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
} from "../../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const productRouter = Router();

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

export default productRouter;
