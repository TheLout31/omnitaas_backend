const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const tokenBlacklist = require("../utils/tokenBlacklist");
const { SECRET_KEY } = require("../config/env");
const User = require("../models/User");

const register = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create and save the new user
    const newUser = new User({
      username,
      password: hashedPassword,
      role: "user", // default role
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Use bcrypt to compare the parsed password against the stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Generate token expiring in 1 hour
      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        SECRET_KEY,
        { expiresIn: "1h" },
      );

      return res.status(200).json({
        message: "Login successful",
        token,
      });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    // req.user is set by the authenticateToken middleware
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile information retrieved successfully",
      user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const logout = (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(400).json({ message: "No token found to invalidate" });
  }

  const token = authHeader.split(" ")[1];

  // Add the current valid token to the blacklist
  tokenBlacklist.add(token);

  res.status(200).json({ message: "Logout successful, token invalidated" });
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
};
