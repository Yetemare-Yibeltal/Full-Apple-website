const express = require("express");
const { body } = require("express-validator");

const {
  initializeChapaPayment,
  verifyChapaPayment,
  chapaWebhook,
  initializeStripePayment,
  stripeWebhook,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

// --- Chapa ---
router.post(
  "/chapa/initialize",
  protect,
  [body("orderId").notEmpty().withMessage("orderId is required")],
  validate,
  initializeChapaPayment,
);
router.get("/chapa/verify/:txRef", protect, verifyChapaPayment);
// Webhook is public (called by Chapa's servers, not the browser) - note this
// route is mounted BEFORE the general JSON body parser in app.js is a non-issue
// here since Chapa sends normal JSON, only Stripe's webhook needs the raw body.
router.post("/chapa/webhook", chapaWebhook);

// --- Stripe ---
router.post(
  "/stripe/initialize",
  protect,
  [body("orderId").notEmpty().withMessage("orderId is required")],
  validate,
  initializeStripePayment,
);
// NOTE: the raw-body middleware for this route is applied in app.js,
// BEFORE express.json() runs, since Stripe's signature check needs the
// untouched raw request body. Do not add express.json() handling here.
router.post("/stripe/webhook", stripeWebhook);

module.exports = router;
