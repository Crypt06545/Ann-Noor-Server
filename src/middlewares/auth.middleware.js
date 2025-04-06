import jwt from "jsonwebtoken";
import apiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user-model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new apiError(401, "Unautorized access !!");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // console.log(decodedToken, "hello decode-->");

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new apiError(401, "Invalid Access Token !!");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new apiError(401, error?.message || "Invalid Access Token!!");
  }
});

// admin access route 

export const adminOnly = asyncHandler(async (req, res, next) => {
  try {
    await verifyJWT(req, res, () => {});
    const user = req.user;
    if (!user) {
      throw new apiError(401, "Unauthorized access");
    }
    if (user.role !== "admin") {
      throw new apiError(403, "Forbidden: Admin access required");
    }

    next();
  } catch (error) {
    throw new apiError(401, error.message);
  }
});
