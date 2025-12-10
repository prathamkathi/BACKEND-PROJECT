import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

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

    // decide folder based on file extension (image / video / others)
    const ext = path.extname(localFilePath).toLowerCase();

    let folder = "others";
    if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"].includes(ext)) {
      folder = "images";
    } else if ([".mp4", ".mov", ".mkv", ".avi", ".webm"].includes(ext)) {
      folder = "videos";
    }

    // upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder,
    }); // (path, options)

    // file upload successful
    console.log("file is uploaded on cloudinary:", response.secure_url);

    // remove temp file from local storage after successful upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // unlink synchronously
    }

    return response;
  } catch (error) {
    console.log("CLOUDINARY ERROR >>>", error.message);

    // remove the temporarily saved file from server if upload fails
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // unlink synchronously
    }

    return null;
  }
};
