const jwt = require("jsonwebtoken");

/**
 * Signs a JWT for the given user id and sets it as an httpOnly cookie
 * on the response. httpOnly means client-side JS can never read the
 * token (protects against XSS token theft); the cookie is also marked
 * secure + sameSite in production.
 */
function generateToken(res, userId) {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  const cookieName = process.env.COOKIE_NAME || "apple_store_token";
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
}

module.exports = generateToken;
