const Wishlist = require("../models/Wishlist");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Fetches the current user's wishlist, creating an empty one if none exists.
 */
async function getOrCreateWishlist(userId) {
  let wishlist = await Wishlist.findOne({ user: userId }).populate(
    "items.product",
    "name slug media basePrice isActive rating",
  );

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, items: [] });
  }

  return wishlist;
}

/**
 * @route   GET /api/wishlist
 * @access  Private
 */
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);
  res.status(200).json({ wishlist });
});

/**
 * @route   POST /api/wishlist/:productId
 * @access  Private
 */
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, items: [] });
  }

  const alreadySaved = wishlist.items.some(
    (item) => item.product.toString() === productId,
  );
  if (!alreadySaved) {
    wishlist.items.push({ product: productId });
    await wishlist.save();
  }

  const populated = await getOrCreateWishlist(req.user._id);
  res.status(200).json({ message: "Added to wishlist.", wishlist: populated });
});

/**
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    return res.status(404).json({ message: "Wishlist not found." });
  }

  wishlist.items = wishlist.items.filter(
    (item) => item.product.toString() !== productId,
  );
  await wishlist.save();

  const populated = await getOrCreateWishlist(req.user._id);
  res
    .status(200)
    .json({ message: "Removed from wishlist.", wishlist: populated });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
