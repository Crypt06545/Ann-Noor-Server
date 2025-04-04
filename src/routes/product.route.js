import { Router } from "express";
import { adminOnly, verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllproducts } from "../../controllers/product.controller.js";

const productRouter = Router();

productRouter.route("/all-products").get(verifyJWT, adminOnly, getAllproducts);

export default productRouter;
