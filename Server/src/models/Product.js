const mongoose = require("mongoose");

// One purchasable configuration of a product (e.g. "256GB / Natural Titanium")
const variantSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    colorName: { type: String, trim: true },
    colorHex: { type: String, trim: true, default: "#1d1d1f" }, // drives the color-swatch UI
    storage: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0, default: null }, // strikethrough price when on sale
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, trim: true },
  },
  { _id: true },
);

// A single technical spec row, e.g. { label: "Chip", value: "A18 Pro" }
// Grouped so the frontend can render an Apple-style spec table by section.
const specSchema = new mongoose.Schema(
  {
    group: { type: String, required: true, trim: true }, // e.g. "Display", "Camera", "Performance"
    label: { type: String, required: true, trim: true }, // e.g. "Chip"
    value: { type: String, required: true, trim: true }, // e.g. "A18 Pro chip"
  },
  { _id: false },
);

const mediaSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["image", "video"], default: "image" },
    url: { type: String, required: true }, // /uploads/<filename> or external CDN url
    alt: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    brand: {
      type: String,
      trim: true,
      default: "Apple",
    },
    category: {
      type: String,
      required: true,
      enum: ["iphone", "ipad", "mac", "watch", "tv", "music", "accessories"],
      index: true,
    },
    subcategory: {
      type: String, // e.g. "iPhone 15 Pro" line within the "iphone" category
      trim: true,
      default: "",
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      required: true,
    },
    highlights: {
      type: [String], // short bullet points shown under the hero (max ~5)
      default: [],
    },
    media: {
      type: [mediaSchema],
      default: [],
    },
    modelUrl: {
      type: String, // path to a .glb/.gltf asset for the 3D product stage
      default: null,
    },
    specs: {
      type: [specSchema],
      default: [],
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
    onSale: {
      type: Boolean,
      default: false,
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    salesCount: {
      type: Number,
      default: 0, // incremented on order completion, powers "bestseller" sorting
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    seo: {
      metaTitle: { type: String, trim: true, default: "" },
      metaDescription: { type: String, trim: true, default: "" },
    },
    keywords: {
      type: [String], // natural-language terms (e.g. "best camera", "lightweight") used by AI search matching
      default: [],
    },
    aiGenerated: {
      description: { type: Boolean, default: false },
      tagline: { type: Boolean, default: false },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", description: "text", tagline: "text" });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ featured: 1, isActive: 1 });

// Virtual: cheapest available price across variants, falling back to basePrice
productSchema.virtual("startingPrice").get(function getStartingPrice() {
  if (!this.variants || this.variants.length === 0) return this.basePrice;
  return Math.min(...this.variants.map((v) => v.price));
});

productSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
