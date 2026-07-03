const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");

const {
  chatWithAssistant,
  getConversation,
  naturalLanguageSearch,
  generateProductContent,
} = require("../controllers/aiController");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

// AI calls cost real money per request - a tighter rate limit than the
// general API limiter in app.js protects against runaway usage/abuse.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many AI requests. Please wait a moment and try again.",
  },
});
router.use(aiLimiter);

router.post(
  "/chat",
  [
    body("sessionId").trim().notEmpty().withMessage("sessionId is required"),
    body("message").trim().notEmpty().withMessage("message is required"),
  ],
  validate,
  chatWithAssistant,
);

router.get("/chat/:sessionId", getConversation);

router.post(
  "/search",
  [body("query").trim().notEmpty().withMessage("query is required")],
  validate,
  naturalLanguageSearch,
);

router.post(
  "/generate-description",
  protect,
  authorize("admin"),
  [
    body("name").trim().notEmpty().withMessage("name is required"),
    body("category").trim().notEmpty().withMessage("category is required"),
  ],
  validate,
  generateProductContent,
);

module.exports = router;
