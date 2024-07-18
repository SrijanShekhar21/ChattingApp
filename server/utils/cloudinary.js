import { v2 as cloudinary } from "cloudinary";
import env from "dotenv";
import fs from "fs";
env.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //File has been uploaded succesfully
    console.log("File has been uploaded succesfully on Cloudinary");
    console.log("Now deleting from temp folder");
    fs.unlinkSync(localFilePath);
    console.log(response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    //this removes the file locally saved on our temp server as the upload operation got failed
    return null;
  }
};

export { uploadOnCloudinary };
