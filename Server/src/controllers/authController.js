const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");

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

const logout = asyncHandler(async (req, res) => {
  const cookieName = process.env.COOKIE_NAME || "apple_store_token";
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).json({ message: "Logged out successfully." });
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = { register, login, logout, getMe };
