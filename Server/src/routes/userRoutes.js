const express = require("express");
const { body } = require("express-validator");

const {
  updateProfile,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

// All user account routes require a logged-in user
router.use(protect);

router.put("/profile", updateProfile);

router.put(
  "/password",
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters"),
  ],
  validate,
  changePassword,
);

const addressValidationRules = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("line1").trim().notEmpty().withMessage("Address line 1 is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("country").trim().notEmpty().withMessage("Country is required"),
];

router.get("/addresses", getAddresses);
router.post("/addresses", addressValidationRules, validate, addAddress);
router.put("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);

module.exports = router;
