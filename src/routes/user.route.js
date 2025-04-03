import { Router } from "express";

import { upload } from "../middlewares/multer.middleware.js";
import {
  loginUser,
  logOut,
  registerUser,
} from "../../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();

// path: /api/v1/users/
userRouter
  .route("/register")
  .post(upload.fields([{ name: "avatar", maxCount: 1 }]), registerUser);

userRouter.route("/login").post(loginUser);

// secure route
userRouter.route("/logout").post(verifyJWT, logOut);


export default userRouter;
