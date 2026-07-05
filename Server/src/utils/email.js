const nodemailer = require("nodemailer");
const logger = require("../config/logger");

const hasSmtpConfig = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
);

let transporter = null;

if (hasSmtpConfig) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} else {
  logger.warn(
    "[email] SMTP is not configured. Emails will be logged to the console instead of sent.",
  );
}

/**
 * Sends an email, or logs it to the console if SMTP isn't configured yet
 * (useful for local development without a real mail server).
 *
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 */
async function sendEmail({ to, subject, html }) {
  if (!hasSmtpConfig) {
    logger.info(
      `[email] (not sent, SMTP not configured) To: ${to} | Subject: ${subject}\n${html}`,
    );
    return;
  }

  try {
    await transporter.sendMail({
      from:
        process.env.SMTP_FROM || '"Apple Store" <no-reply@applestore.local>',
      to,
      subject,
      html,
    });
    logger.info(`[email] Sent "${subject}" to ${to}`);
  } catch (err) {
    logger.error(`[email] Failed to send to ${to}: ${err.message}`);
    throw new Error("Failed to send email. Please try again later.");
  }
}

module.exports = sendEmail;
