const Stripe = require("stripe");
const logger = require("./logger");

if (!process.env.STRIPE_SECRET_KEY) {
  logger.warn(
    "[stripe] STRIPE_SECRET_KEY is not set. Stripe payments will fail until it is configured.",
  );
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10",
});

/**
 * Creates a Stripe Checkout Session for an order and returns the hosted
 * payment page URL to redirect the customer to.
 *
 * @param {Object} params
 * @param {string} params.orderId - our order's _id, stored as client_reference_id
 * @param {Array<{name: string, price: number, quantity: number}>} params.items
 * @param {string} params.customerEmail
 * @param {string} params.successUrl
 * @param {string} params.cancelUrl
 * @param {string} [params.currency]
 */
async function createStripeCheckoutSession({
  orderId,
  items,
  customerEmail,
  successUrl,
  cancelUrl,
  currency = "usd",
}) {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: orderId,
    customer_email: customerEmail,
    line_items: items.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100), // Stripe uses the smallest currency unit (cents)
      },
      quantity: item.quantity,
    })),
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session.url;
}

/**
 * Verifies a raw webhook payload's signature against Stripe's signing
 * secret. Must be called with the RAW (unparsed) request body - see
 * app.js, which routes /api/payments/stripe/webhook around express.json().
 */
function constructStripeEvent(rawBody, signature) {
  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );
}

module.exports = { stripe, createStripeCheckoutSession, constructStripeEvent };
