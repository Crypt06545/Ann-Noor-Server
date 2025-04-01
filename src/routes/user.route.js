import { Router } from "express";
import registerUser from "../../controllers/user.controller.js";
const userRouter = Router();

// path: /api/v1/users/
userRouter.route("/register").post(registerUser);

export default userRouter;
