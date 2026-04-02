import "dotenv/config";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const getCloudinaryStorage = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "contacts",
      allowed_formats: ["jpg", "png", "jpeg"],
    },
  });
};

export const upload = multer({
  storage: getCloudinaryStorage(),
});