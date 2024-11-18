import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = async (filePath) => {
  try {
    if (!filePath) return null;

    const response = await cloudinary.uploader.upload(
      filePath,
      {
        resource_type: "image",
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      },
      function (error, result) {
        if (error) console.log(error);
      }
    );
    if (response) fs.unlinkSync(filePath);
    return response;
  } catch (error) {
    console.log(error);
    fs.unlinkSync(filePath);
    return null;
  }
};

const deleteFile = async (url) => {
  try {
    const publicId = url.split("/").pop().split(".")[0];
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    return null;
  }
};

export { uploadFile, deleteFile };
