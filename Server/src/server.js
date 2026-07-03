require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(
      `[server] Apple Store API running on port ${PORT} (${process.env.NODE_ENV || "development"})`,
    );
  });

  process.on("unhandledRejection", (err) => {
    console.error("[server] Unhandled rejection:", err.message);
    server.close(() => process.exit(1));
  });
}

start();
