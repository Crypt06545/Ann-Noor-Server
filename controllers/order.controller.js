import { Order } from "../src/models/order-model.js";
import apiError from "../src/utils/apiError.js";
import apiResponse from "../src/utils/apiResponse.js";
import asyncHandler from "../src/utils/asyncHandler.js";

// create order
export const createOrder = asyncHandler(async (req, res) => {
  const {
    customer,
    payment,
    items,
    subtotal,
    shipping,
    orderTotal,
    orderDate,
  } = req.body;

  // Validate required fields
  if (
    !customer ||
    !payment ||
    !items ||
    items.length === 0 ||
    subtotal === undefined ||
    shipping === undefined ||
    orderTotal === undefined
  ) {
    throw new apiError(400, "All required order fields must be provided");
  }

  // Validate customer details
  const requiredCustomerFields = [
    "phone",
    "email",
    "firstName",
    "lastName",
    "address1",
    "city",
    "country",
    "state",
    "postalCode",
  ];
  for (const field of requiredCustomerFields) {
    if (!customer[field]) {
      throw new apiError(400, `Customer ${field} is required`);
    }
  }

  // Validate payment method
  const validPaymentMethods = ["cod", "bkash", "nagad"];
  if (!validPaymentMethods.includes(payment.method)) {
    throw new apiError(400, "Invalid payment method");
  }

  // Validate payment details for digital payments
  if (payment.method !== "cod") {
    if (
      !payment.details ||
      !payment.details.phone ||
      !payment.details.transactionId
    ) {
      throw new apiError(
        400,
        `Payment details are required for ${payment.method}`
      );
    }
  }

  // Validate order items
  for (const item of items) {
    if (
      !item.productId ||
      !item.name ||
      !item.quantity ||
      item.quantity < 1 ||
      !item.price ||
      item.price < 0 ||
      !item.image
    ) {
      throw new apiError(400, "Invalid order items data");
    }
  }

  // Validate totals
  if (subtotal < 0 || shipping < 0 || orderTotal < 0) {
    throw new apiError(400, "Invalid order totals");
  }

  // Calculate expected order total for verification
  const calculatedSubtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const calculatedTotal = calculatedSubtotal + shipping;

  if (Math.abs(calculatedSubtotal - subtotal) > 0.01) {
    throw new apiError(400, "Subtotal doesn't match calculated items total");
  }

  if (Math.abs(calculatedTotal - orderTotal) > 0.01) {
    throw new apiError(400, "Order total doesn't match calculated total");
  }

  // Get the authenticated user
  const user = req.user;

  // Create order data object
  const orderData = {
    user: user._id, // Associate with user
    customer,
    payment,
    items: items.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
    })),
    subtotal,
    shipping,
    orderTotal,
    status: "Pending",
    isPaid: payment.method === "cod" ? false : true,
    paidAt: payment.method === "cod" ? null : new Date(),
    orderDate: orderDate || new Date(),
  };

  // 1. Create order in Order collection
  const order = await Order.create(orderData);
  if (!order) {
    throw new apiError(500, "Failed to create order");
  }

  // 2. Add the full order to user's orders array
  user.orders.push({
    _id: order._id,
    ...order.toObject(),
  });

  // 3. Clear the user's cart
  user.cartItems = [];

  // Save the updated user
  await user.save();

  // Return success response
  return res.status(201).json(
    new apiResponse(
      201,
      {
        order,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          ordersCount: user.orders.length,
        },
      },
      "Order created successfully in both collections"
    )
  );
});

// Get all orders (for admin)
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res
    .status(200)
    .json(new apiResponse(200, "Orders retrieved successfully", orders));
});

// get order (for users)

// export const getUserOrders = asyncHandler(async (req, res) => {
//   const { email } = req.params;
//   console.log(email);

//   const order = await Order.findOne({email :email})
//   if (!order) {
//     throw new apiError(404,'This user does not exist!!',[])
//   }
//   res.status(200,)
// });

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
