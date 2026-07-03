const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 24,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
      // for 'percentage' this is 0-100, for 'fixed' this is a currency amount
    },
    maxDiscountAmount: {
      type: Number,
      default: null, // caps the discount when discountType is 'percentage'
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited uses
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    applicableCategories: {
      type: [String],
      enum: ["iphone", "ipad", "mac", "watch", "tv", "music", "accessories"],
      default: [], // empty array means "applies to all categories"
    },
    expiresAt: {
      type: Date,
      default: null, // null = never expires
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

/**
 * Validates whether this coupon can currently be applied, independent of
 * the order total (that check happens in the controller against
 * minOrderAmount). Used by both the checkout flow and admin preview.
 */
couponSchema.methods.isValidNow = function isValidNow() {
  if (!this.isActive) return false;
  if (this.expiresAt && this.expiresAt.getTime() < Date.now()) return false;
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit)
    return false;
  return true;
};

module.exports = mongoose.model("Coupon", couponSchema);
