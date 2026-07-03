const express = require("express");
const { body } = require("express-validator");

const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  getPendingReviews,
  moderateReview,
} = require("../controllers/reviewController");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { REVIEW_STATUSES } = require("../config/constants");

const router = express.Router();

const reviewValidationRules = [
  body("product").notEmpty().withMessage("product is required"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment").trim().notEmpty().withMessage("Comment is required"),
];

// --- Public ---
router.get("/product/:productId", getProductReviews);

// --- Admin (must be declared before generic /:id routes below) ---
router.get("/pending", protect, authorize("admin"), getPendingReviews);
router.put(
  "/:id/moderate",
  protect,
  authorize("admin"),
  [body("status").isIn(REVIEW_STATUSES).withMessage("Invalid status")],
  validate,
  moderateReview,
);

// --- Authenticated customer routes ---
router.post("/", protect, reviewValidationRules, validate, createReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);
router.post("/:id/helpful", protect, markHelpful);

module.exports = router;
