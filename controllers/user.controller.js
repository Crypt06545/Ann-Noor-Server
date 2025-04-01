import apiError from "../src/utils/apiError.js";
import asyncHandler from "../src/utils/asyncHandler.js";
import { User } from "../src/models/user-model.js";
import uploadOnCloudinary from "../src/utils/cloudinary.js";
import apiResponse from "../src/utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //   res.status(200).json({ message: "ok " });
  //   get all details from user
  //   validation - not empty
  //   check if user already exists(username,email)
  //   check images for avatar
  //   upload them to cloudinary
  //   create user obj -create entry in db
  //   remvoe password and remove refreshtoken from response
  //   check for user creation
  //   return response
  const { username, email, password } = req.body;
  //   console.log(username, email, password);

  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new apiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new apiError(409, "User with email or username already exists");
  }

  const avatarLocalpath = req.files?.avatar[0]?.path;

  if (!avatarLocalpath) {
    throw new apiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalpath);
  if (!avatar) {
    throw new apiError(400, "Avatar file is required");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    avatar: avatar.url,
    password,
  });

  const createdUser = await User.findOne(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new apiError(500, "Something went wrong register the user");
  }

  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "User registered successfully !!"));
});

export default registerUser;
