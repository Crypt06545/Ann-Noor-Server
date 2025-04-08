import asyncHandler from "../src/utils/asyncHandler.js";

// update order status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const id = req.params.id;
  console.log(id);
});
