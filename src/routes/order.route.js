import { Router } from "express";
import { createOrder, getAllOrders, updateOrderStatus } from "../../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const orderRouter = Router();

orderRouter.route("/update-order-status/:id").patch(updateOrderStatus);
orderRouter.route("/create").post(verifyJWT,createOrder );
orderRouter.route("/all-orders").get(verifyJWT,getAllOrders );

export default orderRouter;