import { Router } from "express";
import { updateOrderStatus } from "../../controllers/order.controller.js";

const orderRouter = Router();

orderRouter.route("/update-order-status/:id").patch(updateOrderStatus);

export default orderRouter;
