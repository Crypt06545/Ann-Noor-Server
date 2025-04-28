import apiError from "../src/utils/apiError.js";
import asyncHandler from "../src/utils/asyncHandler.js";
import { User } from "../src/models/user-model.js";
import uploadOnCloudinary from "../src/utils/cloudinary.js";
import apiResponse from "../src/utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google authentication controller
export const googleAuth = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new apiError(400, "Google token is required");
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Always check by email first
    let user = await User.findOne({ email });

    if (user) {
      // If user exists but doesn't have googleId, attach it
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // If no user found, create new
      user = await User.create({
        username: name.toLowerCase().replace(/\s/g, ''),
        email,
        googleId,
        avatar: picture,
        isVerified: true,
        password: googleId + process.env.JWT_SECRET, // Dummy password
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new apiResponse(200, "Google authentication successful", {
          user: loggedInUser,
          accessToken,
          refreshToken,
        })
      );

  } catch (error) {
    throw new apiError(401, "Invalid Google token");
  }
});

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

  // const avatarLocalpath = req.files?.avatar[0]?.path;

  // if (!avatarLocalpath) {
  //   throw new apiError(400, "Avatar file is required");
  // }

  // const avatar = await uploadOnCloudinary(avatarLocalpath);
  // if (!avatar) {
  //   throw new apiError(400, "Avatar file is required");
  // }

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    // avatar: avatar.url,
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
    .json(new apiResponse(200, "User registered successfully !!", createdUser));
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
      new apiResponse(200, "User looged in successFully!!", {
        user: loggedUser,
        accessToken,
        refreshToken,
      })
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
    .json(new apiResponse(200, "User Log Out SuccessFully!!", {}));
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

// update role
export const updateUserRole = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const { role } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new apiError(404, "User not found!");
  }

  // Validate role exists in request
  if (!role) {
    throw new apiError(400, "Role is required!");
  }

  // Validate role against enum values
  const validRoles = await User.schema.path("role").enumValues;
  if (!validRoles.includes(role)) {
    throw new apiError(400, "Invalid role!");
  }

  // Update the user's role
  const updatedUser = await User.findOneAndUpdate(
    { email },
    { $set: { role } },
    { new: true }
  );

  return res.status(200).json(
    new apiResponse(
      200,
      {
        email: updatedUser.email,
        newRole: updatedUser.role,
      },
      "Role updated successfully"
    )
  );
});

// delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const { email } = req.params;

  const user = await User.findOne({ email });
  if (!user) {
    throw new apiError(404, "User not found!");
  }

  if (user?.role === "admin") {
    throw new apiError(403, "Cannot delete admin accounts!");
  }

  const deletedUser = await User.findOneAndDelete({ email });

  return res.status(200).json(
    new apiResponse(
      200,
      {
        email: deletedUser.email,
        username: deletedUser.username,
        deletedAt: new Date(),
      },
      "User deleted successfully"
    )
  );
});

// is-auth
export const isAuth = asyncHandler(async (req, res) => {
  if (!req?.user || !req?.user?._id) {
    throw new apiError(401, "Unauthorized access!");
  }
  const user = await User.findById(req?.user?._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new apiError(404, "User not found!");
  }
  return res
    .status(200)
    .json(new apiResponse(200, "User authenticated successfully", user));
});

// get all users
export const allUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password -refreshToken");
  if (!users) {
    throw new apiError(500, "Failed to retrieve users");
  }
  res
    .status(200)
    .json(new apiResponse(200, "All users retrieved successfully", users));
});
