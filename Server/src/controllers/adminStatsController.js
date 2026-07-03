const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @route   GET /api/admin/stats/overview
 * @access  Private/Admin
 * High-level cards for the dashboard: revenue, order count, product count,
 * customer count. Revenue only counts paid orders.
 */
const getOverview = asyncHandler(async (req, res) => {
  const [revenueResult, orderCount, productCount, customerCount] =
    await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$pricing.total" } } },
      ]),
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: "customer" }),
    ]);

  res.status(200).json({
    totalRevenue: revenueResult[0]?.total || 0,
    totalOrders: orderCount,
    totalProducts: productCount,
    totalCustomers: customerCount,
  });
});

/**
 * @route   GET /api/admin/stats/sales-trend
 * @access  Private/Admin
 * Daily revenue for the last 30 days, for the dashboard line chart.
 */
const getSalesTrend = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const trend = await Order.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo }, paymentStatus: "paid" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$pricing.total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    trend: trend.map((day) => ({
      date: day._id,
      revenue: day.revenue,
      orders: day.orders,
    })),
  });
});

/**
 * @route   GET /api/admin/stats/top-products
 * @access  Private/Admin
 */
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .sort({ salesCount: -1 })
    .limit(10)
    .select("name slug salesCount basePrice media");

  res.status(200).json({ products });
});

/**
 * @route   GET /api/admin/stats/order-status-breakdown
 * @access  Private/Admin
 */
const getOrderStatusBreakdown = asyncHandler(async (req, res) => {
  const breakdown = await Order.aggregate([
    { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    breakdown: breakdown.map((b) => ({ status: b._id, count: b.count })),
  });
});

module.exports = {
  getOverview,
  getSalesTrend,
  getTopProducts,
  getOrderStatusBreakdown,
};
