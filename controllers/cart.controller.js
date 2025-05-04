import Product from "../src/models/product-model.js";
import apiError from "../src/utils/apiError.js";
import apiResponse from "../src/utils/apiResponse.js";
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
  const { productId, quantity } = req.body;
  const user = req.user;

  // Find the product
  const product = await Product.findById(productId);
  if (!product) {
    throw new apiError(404, "Product not found!");
  }

  // Find if product already exists in cart
  const existingItem = user.cartItems.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    // If it exists, increase quantity
    existingItem.quantity += quantity || 1;
  } else {
    // If not, push new item
    user.cartItems.push({
      product: productId,
      quantity: quantity || 1,
    });
  }

  await user.save();

  return res
    .status(200)
    .json(new apiResponse(200, "Item added successfully!", user.cartItems));
});

// Decrease cart quantity
export const decreaseCartQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = req.user;

  // Find the product
  const product = await Product.findById(productId);
  if (!product) {
    throw new apiError(404, "Product not found!");
  }

  // Find the item in cart
  const existingItem = user.cartItems.find(
    (item) => item.product.toString() === productId
  );

  if (!existingItem) {
    throw new apiError(404, "Item not found in cart!");
  }

  if (existingItem.quantity > 1) {
    existingItem.quantity -= 1;
    await user.save();
    return res
      .status(200)
      .json(new apiResponse(200, "Quantity decreased!", user.cartItems));
  } else {
    user.cartItems = user.cartItems.filter(
      (item) => item.product.toString() !== productId
    );
    await user.save();
    return res
      .status(200)
      .json(new apiResponse(200, "Item removed from cart!", user.cartItems));
  }
});

// clearCart - Remove all items from cart
export const clearCart = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.cartItems.length === 0) {
    return res
      .status(200)
      .json(new apiResponse(200, "Cart is already empty", []));
  }

  user.cartItems = [];

  await user.save();

  return res
    .status(200)
    .json(new apiResponse(200, "Cart cleared successfully", []));
});

// remove from cart 
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = req.user;

  // Find the product
  const product = await Product.findById(productId);
  if (!product) {
    throw new apiError(404, "Product not found!");
  }

  // Check if item exists in cart
  const itemIndex = user.cartItems.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    throw new apiError(404, "Item not found in cart!");
  }

  // Remove the item completely
  user.cartItems.splice(itemIndex, 1);
  await user.save();

  return res
    .status(200)
    .json(new apiResponse(200, "Item removed from cart!", user.cartItems));
});