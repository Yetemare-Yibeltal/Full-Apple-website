const express = require("express");
const { body } = require("express-validator");

const {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { PRODUCT_CATEGORIES } = require("../config/constants");

const router = express.Router();

const productValidationRules = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("slug").trim().notEmpty().withMessage("Slug is required"),
  body("category")
    .isIn(PRODUCT_CATEGORIES)
    .withMessage(`Category must be one of: ${PRODUCT_CATEGORIES.join(", ")}`),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("basePrice")
    .isFloat({ min: 0 })
    .withMessage("Base price must be a positive number"),
];

// --- Public routes ---
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);
router.get("/:slug/related", getRelatedProducts);

// --- Admin-only routes ---
router.post(
  "/",
  protect,
  authorize("admin"),
  productValidationRules,
  validate,
  createProduct,
);
router.put("/:id", protect, authorize("admin"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

module.exports = router;
