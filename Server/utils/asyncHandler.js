/**
 * Wraps an async Express route handler so any thrown error or rejected
 * promise is automatically forwarded to next(err) -> errorHandler.js,
 * instead of requiring a try/catch in every single controller function.
 *
 * Usage:
 *   const getProducts = asyncHandler(async (req, res) => {
 *     const products = await Product.find();
 *     res.json(products);
 *   });
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
