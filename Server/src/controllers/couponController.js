const Coupon = require("../models/Coupon");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @route   POST /api/coupons/validate
 * @access  Private
 * body: { code, subtotal }
 * Lets the checkout page preview a discount before the order is placed,
 * without actually incrementing usedCount (that happens in orderController
 * once the order is confirmed).
 */
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal = 0 } = req.body;

  const coupon = await Coupon.findOne({ code: String(code).toUpperCase() });

  if (!coupon || !coupon.isValidNow()) {
    return res
      .status(400)
      .json({
        valid: false,
        message: "This coupon is invalid or has expired.",
      });
  }

  if (subtotal < coupon.minOrderAmount) {
    return res.status(400).json({
      valid: false,
      message: `This coupon requires a minimum order of $${coupon.minOrderAmount}.`,
    });
  }

  let discount =
    coupon.discountType === "percentage"
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.maxDiscountAmount) {
    discount = Math.min(discount, coupon.maxDiscountAmount);
  }

  res.status(200).json({
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    estimatedDiscount: Math.round(discount * 100) / 100,
  });
});

/**
 * @route   GET /api/coupons
 * @access  Private/Admin
 */
const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.status(200).json({ coupons });
});

/**
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ message: "Coupon created.", coupon });
});

/**
 * @route   PUT /api/coupons/:id
 * @access  Private/Admin
 */
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!coupon) {
    return res.status(404).json({ message: "Coupon not found." });
  }

  res.status(200).json({ message: "Coupon updated.", coupon });
});

/**
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    return res.status(404).json({ message: "Coupon not found." });
  }

  res.status(200).json({ message: "Coupon deleted." });
});

module.exports = {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
