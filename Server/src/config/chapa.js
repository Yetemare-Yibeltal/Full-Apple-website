const logger = require("./logger");

const CHAPA_BASE_URL = "https://api.chapa.co/v1";

if (!process.env.CHAPA_SECRET_KEY) {
  logger.warn(
    "[chapa] CHAPA_SECRET_KEY is not set. Payments will fail until it is configured.",
  );
}

/**
 * Initializes a Chapa transaction and returns the hosted checkout URL the
 * customer should be redirected to.
 *
 * @param {Object} params
 * @param {string} params.amount - amount as a string, e.g. "1500.00"
 * @param {string} params.currency - e.g. "ETB"
 * @param {string} params.email
 * @param {string} params.firstName
 * @param {string} params.lastName
 * @param {string} params.txRef - our unique transaction reference
 * @param {string} params.callbackUrl - Chapa calls this (server-to-server) on completion
 * @param {string} params.returnUrl - browser is redirected here after payment
 */
async function initializeChapaTransaction({
  amount,
  currency = "ETB",
  email,
  firstName,
  lastName,
  txRef,
  callbackUrl,
  returnUrl,
}) {
  const response = await fetch(`${CHAPA_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency,
      email,
      first_name: firstName,
      last_name: lastName,
      tx_ref: txRef,
      callback_url: callbackUrl,
      return_url: returnUrl,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.status !== "success") {
    logger.error(`[chapa] Initialize failed: ${JSON.stringify(data)}`);
    throw new Error(data.message || "Failed to initialize payment with Chapa.");
  }

  return data.data.checkout_url;
}

/**
 * Verifies a transaction's final status directly with Chapa (never trust
 * the client-side redirect alone - always re-verify server-side).
 * @param {string} txRef
 * @returns {Promise<{status: string, amount: string, currency: string}>}
 */
async function verifyChapaTransaction(txRef) {
  const response = await fetch(
    `${CHAPA_BASE_URL}/transaction/verify/${txRef}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    logger.error(`[chapa] Verify failed: ${JSON.stringify(data)}`);
    throw new Error("Failed to verify payment with Chapa.");
  }

  return {
    status: data.data?.status, // "success" when payment completed
    amount: data.data?.amount,
    currency: data.data?.currency,
  };
}

module.exports = { initializeChapaTransaction, verifyChapaTransaction };
