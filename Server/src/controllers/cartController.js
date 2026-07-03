const Cart = require("../models/Cart");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Fetches the current user's cart, creating an empty one if none exists yet.
 * Populates product details so the frontend has everything needed to render.
 */
async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    "name slug media basePrice isActive",
  );

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  return cart;
}

/**
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.status(200).json({ cart });
});

/**
 * @route   POST /api/cart/items
 * @access  Private
 * body: { productId, variantId?, quantity? }
 */
const addToCart = asyncHandler(async (req, res) => {
  const { productId, variantId = null, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ message: "Product not found." });
  }

  let price = product.basePrice;
  let variantLabel = null;

  if (variantId) {
    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Selected variant not found." });
    }
    if (variant.stock < quantity) {
      return res.status(400).json({
        message: `Only ${variant.stock} left in stock for this option.`,
      });
    }
    price = variant.price;
    variantLabel = variant.label;
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) =>
      item.product.toString() === productId &&
      String(item.variantId) === String(variantId),
  );

  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    cart.items.push({
      product: productId,
      variantId,
      variantLabel,
      quantity,
      priceAtAdd: price,
    });
  }

  await cart.save();
  const populated = await getOrCreateCart(req.user._id);

  res.status(200).json({ message: "Item added to cart.", cart: populated });
});

/**
 * @route   PUT /api/cart/items/:itemId
 * @access  Private
 * body: { quantity }
 */
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1." });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found." });
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    return res.status(404).json({ message: "Cart item not found." });
  }

  item.quantity = quantity;
  await cart.save();

  const populated = await getOrCreateCart(req.user._id);
  res.status(200).json({ message: "Cart updated.", cart: populated });
});

/**
 * @route   DELETE /api/cart/items/:itemId
 * @access  Private
 */
const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found." });
  }

  cart.items = cart.items.filter(
    (item) => item._id.toString() !== req.params.itemId,
  );
  await cart.save();

  const populated = await getOrCreateCart(req.user._id);
  res.status(200).json({ message: "Item removed.", cart: populated });
});

/**
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  res
    .status(200)
    .json({ message: "Cart cleared.", cart: { items: [], subtotal: 0 } });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
