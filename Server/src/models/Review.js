const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true, // denormalized so we don't have to populate on every list render
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    images: {
      type: [String],
      default: [],
    },
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

/**
 * Recalculates the parent Product's rating.average / rating.count
 * from all APPROVED reviews. Called after save/remove below.
 */
async function recalcProductRating(productId) {
  const Review = mongoose.model("Review");
  const Product = mongoose.model("Product");

  const stats = await Review.aggregate([
    { $match: { product: productId, status: "approved" } },
    {
      $group: {
        _id: "$product",
        average: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const average = stats.length > 0 ? Math.round(stats[0].average * 10) / 10 : 0;
  const count = stats.length > 0 ? stats[0].count : 0;

  await Product.findByIdAndUpdate(productId, {
    "rating.average": average,
    "rating.count": count,
  });
}

reviewSchema.post("save", function afterSave(doc) {
  recalcProductRating(doc.product).catch((err) =>
    console.error("[review] Failed to recalc product rating:", err.message),
  );
});

reviewSchema.post("findOneAndDelete", function afterDelete(doc) {
  if (doc) {
    recalcProductRating(doc.product).catch((err) =>
      console.error("[review] Failed to recalc product rating:", err.message),
    );
  }
});

module.exports = mongoose.model("Review", reviewSchema);
