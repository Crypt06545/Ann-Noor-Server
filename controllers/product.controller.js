import Product from "../src/models/product-model.js";
import apiError from "../src/utils/apiError.js";
import apiResponse from "../src/utils/apiResponse.js";
import asyncHandler from "../src/utils/asyncHandler.js";
import uploadOnCloudinary, {
  deleteFromCloudinary,
} from "../src/utils/cloudinary.js";

// get all products
export const getAllProducts = asyncHandler(async (req, res) => {
  const allProducts = await Product.find({});

  if (!allProducts) {
    throw new apiError(500, "Failed to retrieve products");
  }

  res
    .status(200)
    .json(
      new apiResponse(200, allProducts, "All products retrieved successfully")
    );
});

// create products
export const createProduct = asyncHandler(async (req, res) => {
  const { name, perfumeTitle, fragranceNotes } = req.body;

  // Validation - Check required fields
  if (
    [name, perfumeTitle, fragranceNotes].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All product fields are required");
  }

  // Check if images were uploaded
  if (!req.files || !req.files.images) {
    throw new apiError(400, "Product images are required");
  }

  // Upload all images to Cloudinary
  const imagesUploadPromises = req?.files?.images.map(async (image) => {
    const cloudinaryResponse = await uploadOnCloudinary(image.path);
    if (!cloudinaryResponse) {
      throw new apiError(500, "Failed to upload product images");
    }
    return cloudinaryResponse.url;
  });

  // Wait for all uploads to complete
  const imageUrls = await Promise.all(imagesUploadPromises);

  // Create product in database
  const product = await Product.create({
    name,
    perfumeTitle,
    fragranceNotes,
    images: imageUrls,
  });

  // Verify product creation
  const createdProduct = await Product.findById(product._id);
  if (!createdProduct) {
    throw new apiError(500, "Failed to create product");
  }

  return res
    .status(201)
    .json(new apiResponse(201, createdProduct, "Product created successfully"));
});

// update a products
export const updateProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  console.log(id);
});

//delete a products


export const deleteProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  // console.log(id);
  const existProduct = await Product.findOneAndDelete({ _id: id });
  if (!existProduct) {
    throw new apiError(400, "Product not found");
  }

  // Delete all images from Cloudinary (if they exist)
  if (existProduct.images && existProduct.images.length > 0) {
    try {
      // Loop through each image and delete it from Cloudinary
      for (const imageUrl of existProduct.images) {
        await deleteFromCloudinary(imageUrl);
      }
    } catch (error) {
      console.error("Error deleting images from Cloudinary:", error);
      // Continue even if deletion fails
    }
  }

  res.status(200).json(new apiResponse(200, "Product Deleted Successfully!!"));
});
