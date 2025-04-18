import Product from "../src/models/product-model.js";
import apiError from "../src/utils/apiError.js";
import apiResponse from "../src/utils/apiResponse";
import asyncHandler from "../src/utils/asyncHandler.js";

// get all cart products
export const getCartProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ _id: { $in: req.user.cartItems } });

  // add quantity for each product
  const cartItems = products.map((product) => {
    const item = req.user.cartItems.find(
      (cartItem) => cartItem.id === product.id
    );
    return { ...product.toJSON(), quantity: item.quantity };
  });

  res.json(cartItems);
});

// addToCart
export const addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = req.user;

  // Verify product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new apiError(404, "Product not found");
  }

  // Check if already in cart
  const existingItem = user.cartItems.find(
    (item) => item.id.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    user.cartItems.push({ id: productId, quantity: 1 });
  }

  await user.save();

  // Return the apiResponse
  return res
    .status(200)
    .json(new apiResponse(200, "Item added successfully!", user.cartItems));
});

// increase quantity
export const updateQuantity = asyncHandler(async (req, res) => {
  const { id: productId } = req.params;
  const { quantity } = req.body;
  const user = req.user;
  const existingItem = user.cartItems.find((item) => item.id === productId);

  if (!existingItem) {
    throw new apiError(404, "Product not found in cart");
  }

  if (quantity === 0) {
    user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    await user.save();
    return res
      .status(200)
      .json(new apiResponse(200, "Product removed from cart", user.cartItems));
  }

  existingItem.quantity = quantity;
  await user.save();

  return res
    .status(200)
    .json(
      new apiResponse(200, "Quantity updated successfully", user.cartItems)
    );
});

// decrease quantity
export const removeAllFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = req.user;

  if (!productId) {
    user.cartItems = [];
  } else {
    user.cartItems = user.cartItems.filter((item) => item.id !== productId);
  }

  await user.save();

  return res
    .status(200)
    .json(new apiResponse(200, "Cart updated successfully", user.cartItems));
});
