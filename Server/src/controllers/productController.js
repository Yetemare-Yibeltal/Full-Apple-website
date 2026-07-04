const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require("../config/constants");

const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    featured,
    onSale,
    sort,
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
  } = req.query;

  const query = { isActive: true };

  if (category) query.category = category;
  if (featured === "true") query.featured = true;
  if (onSale === "true") query.onSale = true;
  if (search) query.$text = { $search: search };

  const sortMap = {
    price_asc: { basePrice: 1 },
    price_desc: { basePrice: -1 },
    newest: { releaseDate: -1 },
    bestseller: { salesCount: -1 },
  };
  const sortBy = sortMap[sort] || { createdAt: -1 };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(limit, 10) || DEFAULT_PAGE_SIZE),
  );

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortBy)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    products,
    pagination: {
      page: pageNum,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true,
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  res.status(200).json({ product });
});

const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  }).limit(4);

  res.status(200).json({ products: related });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({
    ...req.body,
    createdBy: req.user._id,
  });

  res.status(201).json({ message: "Product created.", product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  res.status(200).json({ message: "Product updated.", product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );

  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  res.status(200).json({ message: "Product removed.", product });
});

module.exports = {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
