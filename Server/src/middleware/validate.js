const { validationResult } = require("express-validator");

/**
 * Runs after an array of express-validator rules (e.g. body('email').isEmail()).
 * If any rule failed, responds with a 400 and a clean list of field-level
 * error messages. Otherwise passes control to the controller.
 *
 * Usage:
 *   router.post('/products', [body('name').notEmpty(), body('basePrice').isFloat({ min: 0 })], validate, createProduct)
 */
function validate(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const formatted = errors.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  return res.status(400).json({
    message: "Validation failed",
    errors: formatted,
  });
}

module.exports = validate;
