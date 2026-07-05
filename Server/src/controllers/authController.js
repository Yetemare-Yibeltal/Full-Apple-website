const crypto = require("crypto");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/email");

/**
 * @route   POST /api/auth/register
 * @access  Public
 * Registers a new customer account. Admin accounts are created only via
 * the seed script (utils/seed.js), never through this public endpoint.
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res
      .status(409)
      .json({ message: "An account with this email already exists." });
  }

  const user = await User.create({ name, email, password, role: "customer" });

  generateToken(res, user._id);

  res.status(201).json({
    message: "Account created successfully.",
    user,
  });
});

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  generateToken(res, user._id);

  res.status(200).json({
    message: "Logged in successfully.",
    user,
  });
});

/**
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  const cookieName = process.env.COOKIE_NAME || "apple_store_token";
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).json({ message: "Logged out successfully." });
});

/**
 * @route   GET /api/auth/me
 * @access  Private
 * Returns the currently authenticated user. req.user is set by the
 * `protect` middleware, which already excludes the password field.
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
});

/**
 * @route   POST /api/auth/forgot-password
 * @access  Public
 * body: { email }
 * Always responds with the same generic message whether or not the email
 * exists, so this endpoint can't be used to check which emails are registered.
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const genericResponse = {
    message:
      "If an account with that email exists, a reset link has been sent.",
  };

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json(genericResponse);
  }

  const plainToken = user.generatePasswordResetToken();
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${plainToken}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your Apple Store password",
    html: `
      <p>Hi ${user.name},</p>
      <p>You requested a password reset. Click the link below to set a new password. This link expires in 30 minutes.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });

  res.status(200).json(genericResponse);
});

/**
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 * body: { newPassword }
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpire");

  if (!user) {
    return res
      .status(400)
      .json({ message: "This reset link is invalid or has expired." });
  }

  user.password = newPassword; // pre('save') hook re-hashes automatically
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save();

  res
    .status(200)
    .json({ message: "Password reset successfully. You can now log in." });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
};
