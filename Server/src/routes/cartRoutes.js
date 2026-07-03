const express = require("express");
const { body } = require("express-validator");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

// All cart routes require a logged-in user
router.use(protect);

router.get("/", getCart);

router.post(
  "/items",
  [
    body("productId").notEmpty().withMessage("productId is required"),
    body("quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
  ],
  validate,
  addToCart,
);

router.put(
  "/items/:itemId",
  [
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
  ],
  validate,
  updateCartItem,
);

router.delete("/items/:itemId", removeCartItem);
router.delete("/", clearCart);

module.exports = router;
