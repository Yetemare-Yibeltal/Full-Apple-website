const Review = require("../models/Review");
const Order = require("../models/Order");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @route   GET /api/reviews/product/:productId
 * @access  Public
 * Only approved reviews are shown publicly.
 */
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({
    product: req.params.productId,
    status: "approved",
  }).sort({
    createdAt: -1,
  });
  res.status(200).json({ reviews });
});

/**
 * @route   POST /api/reviews
 * @access  Private
 * body: { product, rating, title?, comment, images? }
 * Automatically marks verifiedPurchase = true if the user has a delivered
 * order containing this product.
 */
const createReview = asyncHandler(async (req, res) => {
  const { product, rating, title, comment, images } = req.body;

  const existing = await Review.findOne({ product, user: req.user._id });
  if (existing) {
    return res
      .status(409)
      .json({ message: "You have already reviewed this product." });
  }

  const hasPurchased = await Order.exists({
    user: req.user._id,
    orderStatus: "delivered",
    "items.product": product,
  });

  const review = await Review.create({
    product,
    user: req.user._id,
    userName: req.user.name,
    rating,
    title,
    comment,
    images: images || [],
    verifiedPurchase: Boolean(hasPurchased),
    status: "pending", // requires admin approval before it's public
  });

  res.status(201).json({
    message: "Review submitted and awaiting approval.",
    review,
  });
});

/**
 * @route   PUT /api/reviews/:id
 * @access  Private (owner only)
 */
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({ message: "Review not found." });
  }
  if (review.user.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "You can only edit your own reviews." });
  }

  const { rating, title, comment, images } = req.body;
  if (rating !== undefined) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment !== undefined) review.comment = comment;
  if (images !== undefined) review.images = images;
  review.status = "pending"; // edited reviews need re-approval

  await review.save();

  res
    .status(200)
    .json({ message: "Review updated and awaiting re-approval.", review });
});

/**
 * @route   DELETE /api/reviews/:id
 * @access  Private (owner) or Admin
 */
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({ message: "Review not found." });
  }

  const isOwner = review.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "You do not have permission to delete this review." });
  }

  await Review.findOneAndDelete({ _id: review._id });

  res.status(200).json({ message: "Review deleted." });
});

/**
 * @route   POST /api/reviews/:id/helpful
 * @access  Private
 */
const markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $inc: { helpfulCount: 1 } },
    { new: true },
  );

  if (!review) {
    return res.status(404).json({ message: "Review not found." });
  }

  res.status(200).json({ message: "Marked as helpful.", review });
});

/**
 * @route   GET /api/reviews/pending
 * @access  Private/Admin
 */
const getPendingReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ status: "pending" })
    .populate("product", "name slug")
    .sort({ createdAt: 1 });
  res.status(200).json({ reviews });
});

/**
 * @route   PUT /api/reviews/:id/moderate
 * @access  Private/Admin
 * body: { status: 'approved' | 'rejected' }
 */
const moderateReview = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const review = await Review.findById(req.params.id);
  if (!review) {
    return res.status(404).json({ message: "Review not found." });
  }

  review.status = status;
  await review.save();

  res.status(200).json({ message: `Review ${status}.`, review });
});

module.exports = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  getPendingReviews,
  moderateReview,
};
