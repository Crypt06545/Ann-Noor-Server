import { Router } from "express";

const cartRouter = Router();

cartRouter.route("/get-cart-products");
cartRouter.route("/add-to-cart");
cartRouter.route("/update-quantiry");
cartRouter.route("/remove-to-cart");
cartRouter.route("/delete-from-cart");

export default cartRouter;
