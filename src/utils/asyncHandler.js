// src/utils/asyncHandler.js

// const asyncHandler = () => {};
// const asyncHandler = (fn) => { async () => {}; }

// use either of the two below

// 1. try-catch asyncHandler
// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// 2. STANDARD asyncHandler
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};
export { asyncHandler };
