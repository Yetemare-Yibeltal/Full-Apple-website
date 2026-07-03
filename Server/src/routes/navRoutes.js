const express = require("express");
const { body } = require("express-validator");

const {
  getNavSections,
  getNavSectionBySlug,
  createNavSection,
  updateNavSection,
  deleteNavSection,
} = require("../controllers/navController");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

const navValidationRules = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("slug").trim().notEmpty().withMessage("Slug is required"),
];

// --- Public routes ---
router.get("/", getNavSections);
router.get("/:slug", getNavSectionBySlug);

// --- Admin-only routes ---
router.post(
  "/",
  protect,
  authorize("admin"),
  navValidationRules,
  validate,
  createNavSection,
);
router.put("/:id", protect, authorize("admin"), updateNavSection);
router.delete("/:id", protect, authorize("admin"), deleteNavSection);

module.exports = router;
