const mongoose = require("mongoose");

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Connects to MongoDB using the URI supplied via environment variables.
 * Retries a few times on startup (useful for slow-waking Atlas clusters or
 * flaky networks), then exits the process if it still can't connect.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("[db] MONGO_URI is not set. Check your .env file.");
    process.exit(1);
  }

  mongoose.set("strictQuery", true);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
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

      return; // success, stop retrying
    } catch (err) {
      console.error(
        `[db] Connection attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`,
      );

      if (attempt === MAX_RETRIES) {
        console.error("[db] Giving up after max retries. Exiting.");
        process.exit(1);
      }

      await wait(RETRY_DELAY_MS);
    }
  }
}

module.exports = connectDB;
