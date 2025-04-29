import { Router } from "express";
import { addToCart } from "../../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const cartRouter = Router();

cartRouter.route("/get-cart-products");
cartRouter.route("/add-to-cart").post(verifyJWT, addToCart);
cartRouter.route("/update-quantity");
cartRouter.route("/remove-to-cart");
cartRouter.route("/delete-from-cart");

export default cartRouter;
