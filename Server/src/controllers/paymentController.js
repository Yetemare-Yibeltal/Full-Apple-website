const Order = require("../models/Order");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../config/logger");
const {
  initializeChapaTransaction,
  verifyChapaTransaction,
} = require("../config/chapa");
const {
  createStripeCheckoutSession,
  constructStripeEvent,
} = require("../config/stripe");

/**
 * @route   POST /api/payments/chapa/initialize
 * @access  Private
 * body: { orderId }
 * Initializes a Chapa transaction for an existing pending order and returns
 * the hosted checkout URL. Chapa's own checkout page lets the customer pick
 * telebirr, CBE Birr/mobile banking, Amole, HelloCash, or a card - we don't
 * need separate integration code per channel.
 */
const initializeChapaPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }
  if (order.user.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "This order does not belong to you." });
  }
  if (order.paymentStatus === "paid") {
    return res
      .status(400)
      .json({ message: "This order has already been paid." });
  }

  const txRef = `order-${order._id}-${Date.now()}`;
  const [firstName, ...rest] = req.user.name.split(" ");
  const lastName = rest.join(" ") || firstName;

  const checkoutUrl = await initializeChapaTransaction({
    amount: order.pricing.total.toFixed(2),
    currency: "ETB",
    email: req.user.email,
    firstName,
    lastName,
    txRef,
    callbackUrl: `${process.env.SERVER_URL}/api/payments/chapa/webhook`,
    returnUrl: `${process.env.CLIENT_URL}/order-confirmation/${order._id}`,
  });

  order.paymentMethod = "chapa";
  order.paymentGateway.txRef = txRef;
  await order.save();

  res.status(200).json({ checkoutUrl, txRef });
});

/**
 * Shared logic for confirming a Chapa payment, used by both the
 * user-facing verify endpoint (after redirect back) and the server-to-server
 * webhook (in case the customer never returns to the site).
 */
async function confirmChapaPayment(txRef) {
  const order = await Order.findOne({ "paymentGateway.txRef": txRef });
  if (!order) {
    logger.warn(`[payments] No order found for Chapa txRef: ${txRef}`);
    return null;
  }

  if (order.paymentStatus === "paid") {
    return order; // already processed, avoid double-processing
  }

  const result = await verifyChapaTransaction(txRef);

  if (result.status === "success") {
    order.paymentStatus = "paid";
    order.paymentGateway.paidAt = new Date();
    order.paymentGateway.channel = result.method || "chapa";
    order.orderStatus = "processing";
    await order.save();
  } else {
    order.paymentStatus = "failed";
    await order.save();
  }

  return order;
}

/**
 * @route   GET /api/payments/chapa/verify/:txRef
 * @access  Private
 * Called by the frontend when the customer is redirected back from Chapa's
 * checkout page (the returnUrl). Re-verifies directly with Chapa's API.
 */
const verifyChapaPayment = asyncHandler(async (req, res) => {
  const order = await confirmChapaPayment(req.params.txRef);

  if (!order) {
    return res
      .status(404)
      .json({ message: "Order not found for this transaction." });
  }

  res.status(200).json({ order });
});

/**
 * @route   POST /api/payments/chapa/webhook
 * @access  Public (called by Chapa's servers)
 * Chapa sends tx_ref in the webhook body. We always re-verify with Chapa's
 * API rather than trusting the webhook payload directly.
 */
const chapaWebhook = asyncHandler(async (req, res) => {
  const { tx_ref: txRef } = req.body;

  if (!txRef) {
    return res.status(400).json({ message: "Missing tx_ref." });
  }

  await confirmChapaPayment(txRef);

  // Chapa just needs a 200 to know we received it
  res.status(200).json({ received: true });
});

/**
 * @route   POST /api/payments/stripe/initialize
 * @access  Private
 * body: { orderId }
 */
const initializeStripePayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }
  if (order.user.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "This order does not belong to you." });
  }
  if (order.paymentStatus === "paid") {
    return res
      .status(400)
      .json({ message: "This order has already been paid." });
  }

  const checkoutUrl = await createStripeCheckoutSession({
    orderId: order._id.toString(),
    items: order.items.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    customerEmail: req.user.email,
    successUrl: `${process.env.CLIENT_URL}/order-confirmation/${order._id}`,
    cancelUrl: `${process.env.CLIENT_URL}/checkout`,
  });

  order.paymentMethod = "stripe";
  await order.save();

  res.status(200).json({ checkoutUrl });
});

/**
 * @route   POST /api/payments/stripe/webhook
 * @access  Public (called by Stripe's servers)
 * IMPORTANT: this route must receive the RAW request body (not JSON-parsed)
 * for signature verification to work - see app.js for the raw body wiring.
 */
const stripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = constructStripeEvent(req.body, signature);
  } catch (err) {
    logger.error(
      `[stripe] Webhook signature verification failed: ${err.message}`,
    );
    return res.status(400).json({ message: "Invalid webhook signature." });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.client_reference_id;

    const order = await Order.findById(orderId);
    if (order && order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      order.paymentGateway.gatewayTransactionId = session.payment_intent;
      order.paymentGateway.channel = "card";
      order.paymentGateway.paidAt = new Date();
      order.orderStatus = "processing";
      await order.save();
    }
  }

  res.status(200).json({ received: true });
});

module.exports = {
  initializeChapaPayment,
  verifyChapaPayment,
  chapaWebhook,
  initializeStripePayment,
  stripeWebhook,
};
