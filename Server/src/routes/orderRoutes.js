const express = require("express");
const { body } = require("express-validator");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { ORDER_STATUSES, PAYMENT_METHODS } = require("../config/constants");

const router = express.Router();

// All order routes require a logged-in user
router.use(protect);

router.post(
  "/",
  [
    body("shippingAddress.fullName")
      .trim()
      .notEmpty()
      .withMessage("Full name is required"),
    body("shippingAddress.phone")
      .trim()
      .notEmpty()
      .withMessage("Phone is required"),
    body("shippingAddress.line1")
      .trim()
      .notEmpty()
      .withMessage("Address line 1 is required"),
    body("shippingAddress.city")
      .trim()
      .notEmpty()
      .withMessage("City is required"),
    body("shippingAddress.country")
      .trim()
      .notEmpty()
      .withMessage("Country is required"),
    body("paymentMethod")
      .optional()
      .isIn(PAYMENT_METHODS)
      .withMessage("Invalid payment method"),
  ],
  validate,
  createOrder,
);

router.get("/mine", getMyOrders);

// --- Admin-only routes (must come before /:id to avoid route collision) ---
router.get("/", authorize("admin"), getAllOrders);
router.put(
  "/:id/status",
  authorize("admin"),
  [
    body("orderStatus")
      .isIn(ORDER_STATUSES)
      .withMessage("Invalid order status"),
  ],
  validate,
  updateOrderStatus,
);

router.get("/:id", getOrderById);

module.exports = router;
