const NavSection = require("../models/NavSection");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @route   GET /api/nav
 * @access  Public
 * Returns only visible sections, ordered for the nav bar. Admins get the
 * full list (including hidden sections) via ?all=true.
 */
const getNavSections = asyncHandler(async (req, res) => {
  const query = req.query.all === "true" ? {} : { isVisible: true };
  const sections = await NavSection.find(query).sort({ order: 1 });
  res.status(200).json({ sections });
});

/**
 * @route   GET /api/nav/:slug
 * @access  Public
 */
const getNavSectionBySlug = asyncHandler(async (req, res) => {
  const section = await NavSection.findOne({
    slug: req.params.slug,
    isVisible: true,
  });

  if (!section) {
    return res.status(404).json({ message: "Section not found." });
  }

  res.status(200).json({ section });
});

/**
 * @route   POST /api/nav
 * @access  Private/Admin
 */
const createNavSection = asyncHandler(async (req, res) => {
  const section = await NavSection.create(req.body);
  res.status(201).json({ message: "Nav section created.", section });
});

/**
 * @route   PUT /api/nav/:id
 * @access  Private/Admin
 */
const updateNavSection = asyncHandler(async (req, res) => {
  const section = await NavSection.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!section) {
    return res.status(404).json({ message: "Section not found." });
  }

  res.status(200).json({ message: "Nav section updated.", section });
});

/**
 * @route   DELETE /api/nav/:id
 * @access  Private/Admin
 */
const deleteNavSection = asyncHandler(async (req, res) => {
  const section = await NavSection.findByIdAndDelete(req.params.id);

  if (!section) {
    return res.status(404).json({ message: "Section not found." });
  }

  res.status(200).json({ message: "Nav section deleted." });
});

module.exports = {
  getNavSections,
  getNavSectionBySlug,
  createNavSection,
  updateNavSection,
  deleteNavSection,
};
