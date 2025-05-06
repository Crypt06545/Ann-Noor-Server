import { Router } from "express";
import {
  createOrder,
  getAllOrders,
  updateOrderStatus,
} from "../../controllers/order.controller.js";
import { adminOnly, verifyJWT } from "../middlewares/auth.middleware.js";

const orderRouter = Router();

orderRouter.route("/update-order-status/:id").patch(updateOrderStatus);
orderRouter.route("/create").post(verifyJWT, adminOnly, createOrder);
orderRouter.route("/all-orders").get(verifyJWT, adminOnly, getAllOrders);

export default orderRouter;
