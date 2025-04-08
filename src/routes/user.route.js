import { Router } from "express";

import { upload } from "../middlewares/multer.middleware.js";
import {
  loginUser,
  logOut,
  refreshAccessToken,
  registerUser,
  updateUserRole,
} from "../../controllers/user.controller.js";
import { adminOnly, verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();

// path: /api/v1/users/
userRouter
  .route("/register")
  .post(upload.fields([{ name: "avatar", maxCount: 1 }]), registerUser);

userRouter.route("/login").post(loginUser);

// secure route
userRouter.route("/logout").post(verifyJWT, logOut);
userRouter.route("/refresh-token").post(refreshAccessToken);
userRouter
  .route("/update-role/:email")
  .patch(verifyJWT, adminOnly, updateUserRole);

export default userRouter;
