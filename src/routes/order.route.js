import { Router } from "express";
import { updateOrderStatus } from "../../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const orderRouter = Router();

orderRouter.route("/update-order-status/:id").patch(updateOrderStatus);
orderRouter.route("/create").post(verifyJWT, );

export default orderRouter;
