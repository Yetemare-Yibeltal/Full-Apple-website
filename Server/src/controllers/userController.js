const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @route   PUT /api/users/profile
 * @access  Private
 * body: { name?, phone?, avatarUrl? }
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatarUrl } = req.body;

  const user = await User.findById(req.user._id);

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

  await user.save();

  res.status(200).json({ message: "Profile updated.", user });
});

/**
 * @route   PUT /api/users/password
 * @access  Private
 * body: { currentPassword, newPassword }
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({ message: "Current password is incorrect." });
  }

  user.password = newPassword; // pre('save') hook re-hashes automatically
  await user.save();

  res.status(200).json({ message: "Password changed successfully." });
});

/**
 * @route   GET /api/users/addresses
 * @access  Private
 */
const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ addresses: user.addresses });
});

/**
 * @route   POST /api/users/addresses
 * @access  Private
 */
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  user.addresses.push(req.body);
  await user.save();

  res
    .status(201)
    .json({ message: "Address added.", addresses: user.addresses });
});

/**
 * @route   PUT /api/users/addresses/:addressId
 * @access  Private
 */
const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return res.status(404).json({ message: "Address not found." });
  }

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  Object.assign(address, req.body);
  await user.save();

  res
    .status(200)
    .json({ message: "Address updated.", addresses: user.addresses });
});

/**
 * @route   DELETE /api/users/addresses/:addressId
 * @access  Private
 */
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(
    (addr) => addr._id.toString() !== req.params.addressId,
  );
  await user.save();

  res
    .status(200)
    .json({ message: "Address removed.", addresses: user.addresses });
});

module.exports = {
  updateProfile,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
};
