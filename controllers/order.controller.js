import { Order } from "../src/models/order-model.js";
import apiError from "../src/utils/apiError.js";
import apiResponse from "../src/utils/apiResponse.js";
import asyncHandler from "../src/utils/asyncHandler.js";

// create order

// update order status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate input exists
  if (!status) {
    throw new apiError(400, "Status is required");
  }

  // Get allowed status values directly from schema
  const validStatuses = Order.schema.path("status").enumValues;

  // Validate against enum values
  if (!validStatuses.includes(status)) {
    throw new apiError(400, `Invalid status!!`);
  }

  // Update order
  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    { status },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedOrder) {
    throw new apiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, updatedOrder, "Order status updated successfully")
    );
});

// delete order
