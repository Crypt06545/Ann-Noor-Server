// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";
// import dotenv from "dotenv";
// dotenv.config();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_SECRET_KEY,
// });

// const uploadOnCloudinary = async (localFilePath) => {
//   try {
//     if (!localFilePath) return null;
//     const response = await cloudinary.uploader.upload(localFilePath, {
//       folder: "products",
//       resource_type: "auto",
//       secure: true,
//     });

//     // console.log("File uploaded to Cloudinary:", response.url);
//     // Delete the local file after successful upload
//     fs.unlinkSync(localFilePath);

//     return response;
//   } catch (error) {
//     // Clean up local file if upload fails
//     fs.unlinkSync(localFilePath);
//     console.error("Cloudinary upload failed:", error.message);
//     return null;
//   }
// };

// export default uploadOnCloudinary;

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const uploadOnCloudinary = async (fileBuffer, filename) => {
  try {
    if (!fileBuffer) return null;

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "products",
          resource_type: "auto",
          public_id: filename.split(".")[0],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      uploadStream.end(fileBuffer);
    });

    return result;
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);
    return null;
  }
};

export default uploadOnCloudinary;


export const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return null;
    // Extract public_id from the URL (handles Cloudinary URL format)
    const parts = imageUrl.split("/");
    const folderAndFile = parts.slice(-2).join("/"); // e.g., "products/iyezebqregi8olf7saib"
    const publicId = folderAndFile.split(".")[0]; // Removes file extension
    // http://res.cloudinary.com/dcf5jzxpy/image/upload/v1743824838/products/pm4qgzzxpzq9gesijcmy.jpg
    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary deletion failed:", error.message);
    return null;
  }
};