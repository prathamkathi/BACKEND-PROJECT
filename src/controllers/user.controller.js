import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// generate AT & RT – no need for async wrapper, it's not a web request
export const generateAccessAndRefreshTokens = async (userId) => {
  const user = await User.findById(userId);

  if (!user) throw new ApiError(404, "user not found while generating tokens");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // user.accessToken = accessToken; // not needed
  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false }); // don't run all validations for this 'save'

  return { accessToken, refreshToken };
};

export const registerUser = asyncHandler(async (req, res) => {
  // console.log("FILES >>>", req.files);
  // console.log("BODY >>>", req.body);

  //
  // ALGORITHM

  // 1. get user details from frontend
  // 2. validation checks for fields – like not empty
  // 3. check if user already exists – username, email
  // 4. check for image(s) - avatar image (reqd), cover image (optional)
  // 5. upload them to cloudinary and get the url of avatar (at least)
  // 6. create user object - create entry into db
  // 7. check for user creation, return response or throw error otherwise
  // 8. from response (to be sent to user), remove sensitive data - password and token

  // 1. get user details from frontend
  const { username, email, fullName, password } = req.body;
  // console.log(req.body);

  // 2. check for empty fields
  // if (fullName === "") throw new ApiError(400, 'fullname is required'); // aam zindagi
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "") // mentos zindagi
    // if any of the fields, if they exist, whent trimmed, are empty (""), return true
  )
    throw new ApiError(400, "all fields are required");

  // 3. check if user exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }], // agar username match ho jaye YA email match ho jaye, toh woh user mil jayega
  });
  if (existedUser)
    throw new ApiError(409, "user with email or username already exists");

  // 4. check for images
  // req.files, this access is given to us by multer
  const avatarLocalPath = req.files?.avatar?.[0]?.path; // required field

  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath; // another way
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // 5. upload on cloudinary
  if (!avatarLocalPath) throw new ApiError(400, "avatar file is required");

  const avatar = await uploadOnCloudinary(avatarLocalPath); // object
  if (!avatar) throw new ApiError(400, "avatar file is required");

  let coverImage;
  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  }

  // 6. create new user
  const user = await User.create({
    username: username.toLowerCase(), //
    email,
    password,
    fullName,
    avatar: avatar.url, //
    coverImage: coverImage?.url || "", //
  });

  // 7. check for user creation & 8. remove
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
    // use -field1(space)-field2 for deselection
  );
  if (!createdUser)
    throw new ApiError(500, "something went wrong while registering the user");

  // if all goes well, return a response
  res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));

  // testing
  // res.status(200).json({ message: "user registered" });
});

export const loginUser = asyncHandler(async (req, res) => {
  // 1. take necessary login details from user (frontend); username & password
  // 2. username or email exist?
  // 3. find user in db
  // 4. user exists, check password
  // 5. generated AT & RT (access & refresh)
  // 6. send these tokens as secure cookies as response

  // 1.
  const { username, email, password } = req.body;

  // 2.
  if (!username && !email)
    // if neither is available
    throw new ApiError(400, "username or email is required");

  // 3.
  const user = await User.findOne({
    // find via either, whatever finds it first
    $or: [{ username }, { email }],
  });
  if (!user) throw new ApiError(404, "user does not exist");

  // 4.
  const isPasswordValid = await user.isPasswordCorrect(password); // Boolean
  if (!isPasswordValid) throw new ApiError(401, "invalid user credentials");

  // 5.
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // 6.
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ); // remove unwanted fields before sending the document
  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        // data
        {
          user: loggedInUser,
          accessToken, // good practice to send this too
          refreshToken, // good practice to send this too
        },
        "user logged in successfully"
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  // clear cookies
  // reset refresh token from user document

  // User.findById(user._id)
  // how to access user, no info –> use auth middleware

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      }, // $set operator is used to update the value of a field
    },
    {
      new: true, // returns the updated document, not the pre-updated one
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) throw new ApiError(401, "unauthorized request");

  let decodedToken;
  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (err) {
    // jwt.verify throws on invalid/expired tokens
    throw new ApiError(401, "invalid or expired refresh token");
  }

  const userId = decodedToken?._id || decodedToken?.id; // support both payload shapes
  if (!userId) throw new ApiError(401, "invalid refresh token payload");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(401, "invalid refresh token");

  // make sure the refresh token matches what we have stored
  if (user.refreshToken !== incomingRefreshToken)
    throw new ApiError(401, "refresh token is expired or used");

  const options = {
    httpOnly: true,
    secure: true,
  };

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken,
        },
        "access token refreshed successfully"
      )
    );
});

export const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confPassword } = req.body;

  if (newPassword !== confPassword)
    throw new ApiError(400, "new password and confirm password do not match");

  // since the user is logged in, we can avail req.user object
  const user = await User.findById(req.user._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) throw new ApiError(400, "invalid old password");

  user.password = newPassword;

  user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) =>
  res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"))
);

export const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, username } = req.body; // use another file for media update

  if (!fullName || !email) throw new ApiError(400, "invalid user details");

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
        username: username,
      },
    },
    { new: true }
  ).select("-password");

  res
    .status(200)
    .json(new ApiResponse(200, user, "account details updated successfully"));
});

export const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) throw new ApiError(400, "avatar file is missing");

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url)
    throw new ApiError(400, "error while uploading avatar on cloudinary");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { avatar: avatar.url }, // notice
    },
    { new: true }
  ).select("-password");

  res
    .status(200)
    .json(new ApiResponse(200, user, "avatar changed successfully"));
});

export const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath)
    throw new ApiError(400, "cover image file is missing");

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url)
    throw new ApiError(400, "error while uploading cover image on cloudinary");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { coverImage: coverImage.url }, // notice
    },
    { new: true }
  ).select("-password");

  res
    .status(200)
    .json(new ApiResponse(200, user, "cover image changed successfully"));
});
