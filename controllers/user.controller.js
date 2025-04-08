import apiError from "../src/utils/apiError.js";
import asyncHandler from "../src/utils/asyncHandler.js";
import { User } from "../src/models/user-model.js";
import uploadOnCloudinary from "../src/utils/cloudinary.js";
import apiResponse from "../src/utils/apiResponse.js";
import jwt from "jsonwebtoken";

// access toeken refresh token
export const generateAccessTokenAndRefreshToken = async (useId) => {
  try {
    const user = await User.findById(useId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong whule genereating generate access & refresh token !!"
    );
  }
};

// register a user
export const registerUser = asyncHandler(async (req, res) => {
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

// login a user
export const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new apiError(400, "Username or email must be provided");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new apiError(404, "User is not registered");
  }

  const ispassValid = await user.isPasswordCorrect(password);
  if (!ispassValid) {
    throw new apiError(401, "Invalid user Credintials");
  }
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  // send it cookie
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "User looged in successFully!!"
      )
    );
});

//logout a user
export const logOut = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User Log Out SuccessFully!!"));
});

//refresh access token
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new apiError(401, "Unauthorized request!!");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new apiError(401, "Invalid Refresh Token!!");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new apiError(401, "Refresh Token expired or invalid!!");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new apiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "Access Token Refreshed!!"
        )
      );
  } catch (error) {
    throw new apiError(401, error?.message || "Invalid Refresh Token!!");
  }
});

