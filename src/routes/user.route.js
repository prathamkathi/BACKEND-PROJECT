import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";

const userRouter = Router();

// http:localhost:3000/api/v1/users/register
userRouter.route("/register").post(
  // middleware here
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

// http:localhost:3000/api/v1/users/login
userRouter.route("/login").post(loginUser);

// secured routes
userRouter.route("/logout").post(verifyJWT, logoutUser); // post method is used, and not get
// http:localhost:3000/api/v1/users/logout

export default userRouter;
