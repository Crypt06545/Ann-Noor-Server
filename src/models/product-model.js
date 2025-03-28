import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    perfumeTitle: {
      type: String,
      trim: true,
      required: true,
    },
    fragranceNotes: {
      type: String,
      trim: true,
      required: true,
    },
    lastingTime: {
      type: String,
      trim: true,
      required: true,
    },
    smellProjection: {
      type: String,
      trim: true,
      required: true,
    },
    usage: {
      type: String,
      trim: true,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    stockStatus: {
      type: String,
      required: true,
      enum: ["inStock", "outOfStock", "lowStock"],
      default: "inStock",
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    sku: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
