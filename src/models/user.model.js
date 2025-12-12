import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // index: true, // use only when necessary
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary url
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String, // hash before saving
      required: [true, "password is required"],
    },
    refreshToken: {
      // this token is used to generate new access tokens without requiring the user to log in again
      type: String,
    },
  },
  { timestamps: true }
);

// PASSWORD ENCRYPTION & VALIDATION

// using mongoose 'pre' hook (middleware); pre: do this before saving
userSchema.pre("save", async function () {
  // we want 'this', DON'T USE ARROW FUNC

  // only hash when password field is modified
  if (!this.isModified("password")) return;
  // hash the password
  this.password = await bcrypt.hash(this.password, 10); // hash(what, #rounds)
});

// CUSTOM METHODS FOR SCHEMA
userSchema.methods.isPasswordCorrect = async function (password) {
  // we want 'this', DON'T USE ARROW FUNC

  // bcrypt can check password as well
  return await bcrypt.compare(password, this.password);
  // returns Boolean
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      // payloads go here
      _id: this._id, // needed
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id, // needed
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
