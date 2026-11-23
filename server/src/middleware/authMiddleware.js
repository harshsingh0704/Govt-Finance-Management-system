const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided, access denied" });
    }

    const token = authHeader.split(" ")[1];

    // Local/non-production mock token support for UI/dev flows
    if (
      process.env.NODE_ENV !== "production" &&
      typeof token === "string" &&
      token.startsWith("mock-jwt-token-")
    ) {
      const mockId = token.replace("mock-jwt-token-", "").trim();
      let user = null;

      if (mongoose.Types.ObjectId.isValid(mockId)) {
        user = await User.findById(mockId).select("-password");
      }

      if (!user) {
        const headerUserId = req.headers["x-user-id"];
        if (headerUserId && mongoose.Types.ObjectId.isValid(headerUserId)) {
          user = await User.findById(headerUserId).select("-password");
        }
      }

      if (!user) {
        user = await User.findOne({ isActive: { $ne: false } }).select("-password");
      }

      if (!user || user.isActive === false) {
        return res.status(401).json({ error: "User not found or inactive" });
      }

      req.user = user;
      return next();
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from the server environment.");
      return res.status(500).json({
        error: "Server authentication configuration error",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user || user.isActive === false) {
      return res.status(401).json({ error: "User not found or inactive" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;