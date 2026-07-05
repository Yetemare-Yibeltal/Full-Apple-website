const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "Home" }, // e.g. "Home", "Work"
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true, default: "" },
    city: { type: String, required: true, trim: true },
    region: { type: String, trim: true, default: "" },
    country: { type: String, required: true, trim: true },
    postalCode: { type: String, trim: true, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // never returned by default queries
    },
    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
    resetPasswordToken: {
      type: String,
      select: false,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
      default: null,
    },
  },
  { timestamps: true },
);

// Hash the password only when it's new or has changed
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method used by the login controller
userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

/**
 * Generates a random reset token, stores its HASHED version on the user
 * (so a leaked database never exposes usable tokens), and returns the
 * PLAIN version to be emailed to the user - it can only be used once
 * and only within 30 minutes.
 */
userSchema.methods.generatePasswordResetToken =
  function generatePasswordResetToken() {
    const plainToken = crypto.randomBytes(32).toString("hex");

    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(plainToken)
      .digest("hex");
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

    return plainToken;
  };

// Strip sensitive fields whenever a user doc is serialized to JSON
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpire;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
