const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticateToken = require("../middlewares/authMiddleware");

/**
 * POST /api/register
 * Body: { "username": "...", "password": "..." }
 */
router.post("/register", authController.register);

/**
 * POST /api/login
 * Body: { "username": "...", "password": "..." }
 */
router.post("/login", authController.login);

/**
 * GET /api/profile
 * Requires JWT Token
 */
router.get("/profile", authenticateToken, authController.getProfile);

/**
 * POST /api/logout
 * Requires JWT Token
 */
router.post("/logout", authenticateToken, authController.logout);

module.exports = router;
