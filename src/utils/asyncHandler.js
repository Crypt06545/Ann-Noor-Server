// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.message || "Internal Server Error",
//     });
//   }
// };


// export default asyncHandler;


const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    let statusCode = 500;
    let message = error.message || "Internal Server Error";

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      statusCode = 400;
      const field = Object.keys(error.keyValue)[0];
      message = `Duplicate value for field: ${field}`;
    }

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

export default asyncHandler;

