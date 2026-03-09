const jwt = require("jsonwebtoken");
const tokenBlacklist = require("../utils/tokenBlacklist");
const { SECRET_KEY } = require("../config/env");

/**
 * Middleware to protect routes
 * Validates JWT from the Authorization: Bearer <token> header
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Missing token" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  // Check if token is blacklisted (e.g. user logged out)
  if (tokenBlacklist.has(token)) {
    return res
      .status(403)
      .json({ message: "Forbidden access (Token in blacklist)" });
  }

  // Verify token
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Expired token" });
      }
      return res
        .status(403)
        .json({ message: "Forbidden access (Invalid token)" });
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
