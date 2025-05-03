import { Router } from "express";
import {
  addToCart,
  clearCart,
  decreaseCartQuantity,
  removeFromCart,
} from "../../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const cartRouter = Router();

cartRouter.route("/get-cart-products").get(verifyJWT);
cartRouter.route("/add-to-cart").post(verifyJWT, addToCart);
cartRouter.route("/remove-from-cart").post(verifyJWT, removeFromCart);
cartRouter.route("/decrease-quantity").post(verifyJWT, decreaseCartQuantity);
cartRouter.route("/clear-cart").delete(verifyJWT, clearCart);

export default cartRouter;
