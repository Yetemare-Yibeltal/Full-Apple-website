const mongoose = require("mongoose");

const navLinkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    href: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const navSectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0, // controls left-to-right position in the nav bar
    },
    heroImage: {
      type: String,
      default: null,
    },
    heroHeadline: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    heroSubtext: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    links: {
      type: [navLinkSchema],
      default: [],
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("NavSection", navSectionSchema);
