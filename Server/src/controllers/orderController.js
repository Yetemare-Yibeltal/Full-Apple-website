const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const asyncHandler = require("../utils/asyncHandler");

const SHIPPING_FEE = 0; // free shipping, adjust here if flat-rate shipping is needed
const TAX_RATE = 0; // set to e.g. 0.15 for 15% tax if applicable to your region

/**
 * @route   POST /api/orders
 * @access  Private
 * body: { shippingAddress, paymentMethod, couponCode? }
 * Builds the order from the user's current cart, validates stock,
 * applies a coupon if provided, decrements stock, then clears the cart.
 */
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = "card", couponCode } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
  );

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Your cart is empty." });
  }

  // Build order items and validate stock for each
  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.product;

    if (!product || !product.isActive) {
      return res
        .status(400)
        .json({ message: `A product in your cart is no longer available.` });
    }

    if (item.variantId) {
      const variant = product.variants.id(item.variantId);
      if (!variant || variant.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} (${item.variantLabel}) is out of stock.`,
        });
      }
    }

    const lineTotal = item.priceAtAdd * item.quantity;
    subtotal += lineTotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.media?.[0]?.url || null,
      variantLabel: item.variantLabel,
      price: item.priceAtAdd,
      quantity: item.quantity,
    });
  }

  // Apply coupon if provided
  let discount = 0;
  let appliedCouponCode = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

    if (!coupon || !coupon.isValidNow()) {
      return res
        .status(400)
        .json({ message: "This coupon is invalid or has expired." });
    }
    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `This coupon requires a minimum order of $${coupon.minOrderAmount}.`,
      });
    }

    discount =
      coupon.discountType === "percentage"
        ? (subtotal * coupon.discountValue) / 100
        : coupon.discountValue;

    if (coupon.maxDiscountAmount) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }

    coupon.usedCount += 1;
    await coupon.save();
    appliedCouponCode = coupon.code;
  }

  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.max(0, subtotal + SHIPPING_FEE + tax - discount);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    couponCode: appliedCouponCode,
    pricing: {
      subtotal,
      shippingFee: SHIPPING_FEE,
      tax,
      discount,
      total,
    },
  });

  // Decrement stock and increment sales count for each purchased product
  for (const item of cart.items) {
    const product = item.product;
    if (item.variantId) {
      const variant = product.variants.id(item.variantId);
      variant.stock -= item.quantity;
    }
    product.salesCount += item.quantity;
    await product.save();
  }

  // Clear the cart now that the order is placed
  cart.items = [];
  await cart.save();

  res.status(201).json({ message: "Order placed successfully.", order });
});

/**
 * @route   GET /api/orders/mine
 * @access  Private
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.status(200).json({ orders });
});

/**
 * @route   GET /api/orders/:id
 * @access  Private (owner) or Admin
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }

  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "You do not have access to this order." });
  }

  res.status(200).json({ order });
});

/**
 * @route   GET /api/orders
 * @access  Private/Admin
 * Supports ?status=pending&page=1&limit=20
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.orderStatus = status;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, parseInt(limit, 10) || 20);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    orders,
    pagination: {
      page: pageNum,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

/**
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 * body: { orderStatus, trackingNumber? }
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, trackingNumber } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }

  order.orderStatus = orderStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (orderStatus === "delivered") order.deliveredAt = new Date();
  if (orderStatus === "cancelled") order.cancelledAt = new Date();

  await order.save();

  res.status(200).json({ message: "Order status updated.", order });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
