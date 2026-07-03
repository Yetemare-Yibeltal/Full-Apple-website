const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true }, // e.g. "128GB / Midnight"
    color: { type: String, trim: true },
    storage: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0, default: null }, // for showing a strikethrough price
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, trim: true },
  },
  { _id: true },
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
    category: {
      type: String,
      required: true,
      enum: ["iphone", "ipad", "mac", "watch", "tv", "music", "accessories"],
      index: true,
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
      type: [String],
      default: [],
    },
    images: {
      type: [String], // stored as /uploads/<filename> paths
      default: [],
    },
    modelUrl: {
      type: String, // optional path to a .glb/.gltf 3D asset for the product stage
      default: null,
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
  },
  { timestamps: true },
);

productSchema.index({ name: "text", description: "text", tagline: "text" });

module.exports = mongoose.model("Product", productSchema);
