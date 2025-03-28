import mongoose, { Schema } from "mongoose";

const UserSchema = Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    
    isAdmin: {
      type: Boolean,
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
