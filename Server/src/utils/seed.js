require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = require("../config/db");
const User = require("../models/User");
const Product = require("../models/Product");
const NavSection = require("../models/NavSection");
const logger = require("../config/logger");

const products = [
  {
    name: "iPhone 16 Pro",
    slug: "iphone-16-pro",
    category: "iphone",
    subcategory: "iPhone 16 Pro",
    tagline: "Titanium. So strong. So light. So Pro.",
    description:
      "iPhone 16 Pro features a stunning titanium design, the powerful A18 Pro chip, and a pro camera system for our best low-light photos ever.",
    highlights: [
      "A18 Pro chip",
      "Titanium design",
      "48MP Fusion camera",
      "Action button",
    ],
    media: [
      {
        type: "image",
        url: "/uploads/placeholder-iphone.jpg",
        alt: "iPhone 16 Pro",
      },
    ],
    specs: [
      {
        group: "Performance",
        label: "Chip",
        value: "A18 Pro chip with 6-core GPU",
      },
      {
        group: "Display",
        label: "Screen",
        value: "6.3-inch Super Retina XDR display",
      },
      {
        group: "Camera",
        label: "Rear Camera",
        value: "48MP Fusion, 48MP Ultra Wide, 12MP Telephoto",
      },
      {
        group: "Battery",
        label: "Battery Life",
        value: "Up to 27 hours video playback",
      },
    ],
    basePrice: 999,
    variants: [
      {
        label: "128GB / Black Titanium",
        colorName: "Black Titanium",
        colorHex: "#3b3b3d",
        storage: "128GB",
        price: 999,
        stock: 25,
      },
      {
        label: "256GB / Natural Titanium",
        colorName: "Natural Titanium",
        colorHex: "#a8a196",
        storage: "256GB",
        price: 1099,
        stock: 18,
      },
      {
        label: "512GB / Desert Titanium",
        colorName: "Desert Titanium",
        colorHex: "#c8ad8d",
        storage: "512GB",
        price: 1299,
        stock: 10,
      },
    ],
    featured: true,
    keywords: ["best camera", "flagship phone", "titanium", "pro camera"],
  },
  {
    name: "iPad Pro",
    slug: "ipad-pro",
    category: "ipad",
    tagline: "Unbelievably thin. Impossibly powerful.",
    description:
      "iPad Pro with the M4 chip delivers desktop-class performance in our thinnest design ever, with a stunning Ultra Retina XDR display.",
    highlights: [
      "M4 chip",
      "Ultra Retina XDR display",
      "Apple Pencil Pro support",
      "Thinnest Apple product ever",
    ],
    media: [
      { type: "image", url: "/uploads/placeholder-ipad.jpg", alt: "iPad Pro" },
    ],
    specs: [
      { group: "Performance", label: "Chip", value: "Apple M4 chip" },
      {
        group: "Display",
        label: "Screen",
        value: "13-inch Ultra Retina XDR display",
      },
      { group: "Design", label: "Thickness", value: "5.1mm" },
    ],
    basePrice: 1299,
    variants: [
      {
        label: "256GB / Silver",
        colorName: "Silver",
        colorHex: "#e3e4e5",
        storage: "256GB",
        price: 1299,
        stock: 15,
      },
      {
        label: "512GB / Space Black",
        colorName: "Space Black",
        colorHex: "#2b2b2c",
        storage: "512GB",
        price: 1499,
        stock: 12,
      },
    ],
    featured: true,
    keywords: ["tablet", "lightweight", "drawing", "apple pencil"],
  },
  {
    name: 'MacBook Pro 14"',
    slug: "macbook-pro-14",
    category: "mac",
    tagline: "Mind-blowing. Head-turning.",
    description:
      "The MacBook Pro 14-inch with the M4 Pro chip delivers exceptional performance for the most demanding workflows, with a stunning Liquid Retina XDR display.",
    highlights: [
      "M4 Pro chip",
      "Up to 22 hours battery life",
      "Liquid Retina XDR display",
      "1080p FaceTime HD camera",
    ],
    media: [
      {
        type: "image",
        url: "/uploads/placeholder-macbook.jpg",
        alt: "MacBook Pro 14 inch",
      },
    ],
    specs: [
      {
        group: "Performance",
        label: "Chip",
        value: "Apple M4 Pro chip, 12-core CPU",
      },
      {
        group: "Display",
        label: "Screen",
        value: "14.2-inch Liquid Retina XDR display",
      },
      { group: "Battery", label: "Battery Life", value: "Up to 22 hours" },
    ],
    basePrice: 1999,
    variants: [
      {
        label: "512GB / Space Black",
        colorName: "Space Black",
        colorHex: "#2b2b2c",
        storage: "512GB",
        price: 1999,
        stock: 8,
      },
      {
        label: "1TB / Silver",
        colorName: "Silver",
        colorHex: "#e3e4e5",
        storage: "1TB",
        price: 2399,
        stock: 6,
      },
    ],
    featured: true,
    keywords: ["laptop", "best camera", "lightweight", "video editing"],
  },
  {
    name: "Apple Watch Series 10",
    slug: "apple-watch-series-10",
    category: "watch",
    tagline: "Thinner. Bigger. Smarter.",
    description:
      "Apple Watch Series 10 features our thinnest design ever, a larger display, and advanced health and fitness tools to help you live a healthier day.",
    highlights: [
      "Largest display ever",
      "Sleep apnea notifications",
      "Water resistant 50m",
      "S10 SiP chip",
    ],
    media: [
      {
        type: "image",
        url: "/uploads/placeholder-watch.jpg",
        alt: "Apple Watch Series 10",
      },
    ],
    specs: [
      { group: "Design", label: "Case Size", value: "42mm or 46mm" },
      {
        group: "Health",
        label: "Sensors",
        value: "Blood oxygen, ECG, temperature sensing",
      },
    ],
    basePrice: 399,
    variants: [
      {
        label: "42mm / Jet Black",
        colorName: "Jet Black",
        colorHex: "#1c1c1e",
        price: 399,
        stock: 30,
      },
      {
        label: "46mm / Rose Gold",
        colorName: "Rose Gold",
        colorHex: "#e8c5b5",
        price: 429,
        stock: 22,
      },
    ],
    keywords: ["fitness tracker", "smartwatch", "health"],
  },
  {
    name: "Apple TV 4K",
    slug: "apple-tv-4k",
    category: "tv",
    tagline: "A gorgeous new picture, a new feel for the room.",
    description:
      "The new Apple TV 4K delivers stunning color and clarity, with support for Dolby Vision and immersive Dolby Atmos sound.",
    highlights: [
      "A15 Bionic chip",
      "Dolby Vision & HDR10+",
      "Dolby Atmos sound",
      "Thread smart home hub",
    ],
    media: [
      {
        type: "image",
        url: "/uploads/placeholder-appletv.jpg",
        alt: "Apple TV 4K",
      },
    ],
    specs: [
      { group: "Performance", label: "Chip", value: "A15 Bionic chip" },
      { group: "Video", label: "Resolution", value: "Up to 4K HDR at 60fps" },
    ],
    basePrice: 129,
    variants: [
      { label: "64GB", storage: "64GB", price: 129, stock: 40 },
      { label: "128GB", storage: "128GB", price: 149, stock: 35 },
    ],
    keywords: ["streaming", "home theater", "media box"],
  },
  {
    name: "AirPods Pro 2",
    slug: "airpods-pro-2",
    category: "music",
    tagline: "Adaptive Audio. Now playing.",
    description:
      "AirPods Pro 2 feature Adaptive Audio, Active Noise Cancellation, and a new Hearing Aid feature, powered by the H2 chip.",
    highlights: [
      "Adaptive Audio",
      "Active Noise Cancellation",
      "Hearing Health features",
      "Up to 6 hours listening time",
    ],
    media: [
      {
        type: "image",
        url: "/uploads/placeholder-airpods.jpg",
        alt: "AirPods Pro 2",
      },
    ],
    specs: [
      { group: "Audio", label: "Chip", value: "H2 chip" },
      {
        group: "Battery",
        label: "Listening Time",
        value: "Up to 6 hours with ANC on",
      },
    ],
    basePrice: 249,
    variants: [{ label: "Standard", price: 249, stock: 50 }],
    keywords: ["earbuds", "noise cancelling", "wireless headphones"],
  },
  {
    name: "MagSafe Charger",
    slug: "magsafe-charger",
    category: "accessories",
    tagline: "Effortless, perfectly aligned wireless charging.",
    description:
      "The MagSafe Charger attaches securely to iPhone with perfectly aligned magnets for faster wireless charging.",
    highlights: [
      "Perfect magnetic alignment",
      "Up to 15W charging",
      "Compact, travel-friendly design",
    ],
    media: [
      {
        type: "image",
        url: "/uploads/placeholder-magsafe.jpg",
        alt: "MagSafe Charger",
      },
    ],
    specs: [{ group: "Charging", label: "Output", value: "Up to 15W" }],
    basePrice: 39,
    variants: [{ label: "Standard", price: 39, stock: 100 }],
    keywords: ["charger", "wireless charging", "accessory"],
  },
];

const navSections = [
  {
    title: "Store",
    slug: "store",
    order: 0,
    links: [{ label: "Shop All", href: "/shop" }],
  },
  {
    title: "iPhone",
    slug: "iphone",
    order: 1,
    links: [{ label: "Explore iPhone", href: "/iphone" }],
  },
  {
    title: "iPad",
    slug: "ipad",
    order: 2,
    links: [{ label: "Explore iPad", href: "/ipad" }],
  },
  {
    title: "Mac",
    slug: "mac",
    order: 3,
    links: [{ label: "Explore Mac", href: "/mac" }],
  },
  {
    title: "Watch",
    slug: "watch",
    order: 4,
    links: [{ label: "Explore Watch", href: "/watch" }],
  },
  {
    title: "TV & Music",
    slug: "tv-music",
    order: 5,
    links: [{ label: "Explore TV", href: "/tv" }],
  },
  {
    title: "Support",
    slug: "support",
    order: 6,
    links: [{ label: "Get Support", href: "/support" }],
  },
];

async function seed() {
  await connectDB();

  logger.info("[seed] Clearing existing products and nav sections...");
  await Product.deleteMany({});
  await NavSection.deleteMany({});

  logger.info("[seed] Creating admin user (if not already present)...");
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    await User.create({
      name: "Store Admin",
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || "change_this_password",
      role: "admin",
    });
    logger.info(`[seed] Admin created: ${adminEmail}`);
  } else {
    logger.info("[seed] Admin already exists, skipping.");
  }

  logger.info("[seed] Inserting products...");
  await Product.insertMany(products);

  logger.info("[seed] Inserting nav sections...");
  await NavSection.insertMany(navSections);

  logger.info(
    `[seed] Done. ${products.length} products and ${navSections.length} nav sections created.`,
  );
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  logger.error(`[seed] Failed: ${err.message}`);
  process.exit(1);
});
