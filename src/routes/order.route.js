import { Router } from "express";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  updateOrderStatus,
} from "../../controllers/order.controller.js";
import { adminOnly, verifyJWT } from "../middlewares/auth.middleware.js";

const orderRouter = Router();

orderRouter
  .route("/update-order-status/:id")
  .patch(verifyJWT, adminOnly, updateOrderStatus);
orderRouter.route("/create").post(verifyJWT, adminOnly, createOrder);
orderRouter.route("/delete/:id").delete(verifyJWT, adminOnly, deleteOrder);
orderRouter.route("/all-orders").get(verifyJWT, adminOnly, getAllOrders);

export default orderRouter;
