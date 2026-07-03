const express = require("express");
const { body } = require("express-validator");

const {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponController");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { DISCOUNT_TYPES } = require("../config/constants");

const router = express.Router();

router.post(
  "/validate",
  protect,
  [body("code").trim().notEmpty()],
  validate,
  validateCoupon,
);

// --- Admin-only ---
router.get("/", protect, authorize("admin"), getAllCoupons);
router.post(
  "/",
  protect,
  authorize("admin"),
  [
    body("code")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Code must be at least 3 characters"),
    body("discountType")
      .isIn(DISCOUNT_TYPES)
      .withMessage("Invalid discount type"),
    body("discountValue")
      .isFloat({ min: 0 })
      .withMessage("Discount value must be a positive number"),
  ],
  validate,
  createCoupon,
);
router.put("/:id", protect, authorize("admin"), updateCoupon);
router.delete("/:id", protect, authorize("admin"), deleteCoupon);

module.exports = router;
