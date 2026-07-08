const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const { notFound, errorHandler } = require("./middleware/errorHandler");
const { stripeWebhook } = require("./controllers/paymentController");

const app = express();

// --- Security middleware ---
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// --- Stripe webhook MUST be registered with the raw body, BEFORE
// express.json() runs below, or signature verification will fail. ---
app.post(
  "/api/payments/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

// --- Standard body/cookie parsing for everything else ---
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// --- Rate limiting (applies to API routes only) ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// --- Static file serving for uploaded product images ---
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// --- Route mounts (added in Phase 2) ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/nav", require("./routes/navRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/coupons", require("./routes/couponRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin/stats", require("./routes/adminStatsRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
// Note: /api/payments/stripe/webhook is already mounted above (raw body).
// This mount covers the rest of the payment routes (chapa + stripe initialize/verify).
app.use("/api/payments", require("./routes/paymentRoutes"));

// --- 404 + centralized error handling (from middleware/errorHandler.js) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
