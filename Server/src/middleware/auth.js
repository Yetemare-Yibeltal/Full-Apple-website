const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Verifies the JWT and attaches the authenticated user to req.user.
 * Reads the token from an httpOnly cookie first, falling back to the
 * Authorization header (useful for API testing tools like Postman).
 */
async function protect(req, res, next) {
  try {
    const cookieName = process.env.COOKIE_NAME || "apple_store_token";
    let token = req.cookies?.[cookieName];

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authenticated. Please log in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "User for this session no longer exists." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Invalid or expired session. Please log in again." });
  }
}

/**
 * Restricts a route to specific roles. Must run after `protect`.
 * Usage: router.post('/products', protect, authorize('admin'), createProduct)
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action.",
      });
    }
    next();
  };
}

module.exports = { protect, authorize };
