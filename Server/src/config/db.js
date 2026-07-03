const mongoose = require("mongoose");

/**
 * Connects to MongoDB using the URI supplied via environment variables.
 * Exits the process on failure so the app never runs against a broken DB.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("[db] MONGO_URI is not set. Check your .env file.");
    process.exit(1);
  }

  mongoose.set("strictQuery", true);

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: process.env.NODE_ENV !== "production",
    });

    console.log(
      `[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`,
    );

    mongoose.connection.on("error", (err) => {
      console.error(
        "[db] Connection error after initial connect:",
        err.message,
      );
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("[db] MongoDB disconnected.");
    });
  } catch (err) {
    console.error("[db] Initial connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
