/**
 * Central place for enums and fixed values shared across models, controllers,
 * and routes. Keeping these in one file means a category or status can be
 * added/renamed in exactly one place instead of hunting through every model.
 */

const PRODUCT_CATEGORIES = [
  "iphone",
  "ipad",
  "mac",
  "watch",
  "tv",
  "music",
  "accessories",
];

const USER_ROLES = ["admin", "customer"];

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

// chapa covers Ethiopian channels (telebirr, CBE Birr/mobile banking, Amole,
// HelloCash, and cards) through its own hosted checkout - stripe covers
// international card payments separately.
const PAYMENT_METHODS = ["chapa", "stripe", "cash_on_delivery"];

const REVIEW_STATUSES = ["pending", "approved", "rejected"];

const DISCOUNT_TYPES = ["percentage", "fixed"];

// Pagination defaults used by every "list" endpoint (products, orders, reviews)
const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 60;

module.exports = {
  PRODUCT_CATEGORIES,
  USER_ROLES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  REVIEW_STATUSES,
  DISCOUNT_TYPES,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
};
