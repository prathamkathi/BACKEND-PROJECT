import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

dotenv.config();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload file on cloudinary
    let response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    }); // (path, options)
    // file upload successfull
    // console.log("file is uploaded on cloudinary:", response.url);
    console.log("file is uploaded on cloudinary:", response.secure_url);
    fs.unlinkSync(localFilePath); // unlink synchronously
    return response;
  } catch (error) {
    console.log("CLOUDINARY ERROR >>>", error.message);
    // remove the temporarily saved file from server if upload fails
    fs.unlinkSync(localFilePath); // unlink synchronously
    return null;
  }
};
