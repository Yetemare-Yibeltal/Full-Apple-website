const express = require("express");

const {
  getOverview,
  getSalesTrend,
  getTopProducts,
  getOrderStatusBreakdown,
} = require("../controllers/adminStatsController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Every route here is admin-only
router.use(protect, authorize("admin"));

router.get("/overview", getOverview);
router.get("/sales-trend", getSalesTrend);
router.get("/top-products", getTopProducts);
router.get("/order-status-breakdown", getOrderStatusBreakdown);

module.exports = router;
