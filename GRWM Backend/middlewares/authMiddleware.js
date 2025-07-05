const jwt = require("jsonwebtoken");

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided. Please log in.",
      data: null,
    });
  }

  try {
    // Verify token using JWT secret from environment
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data (userId, role) to the request object
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token. Please log in again.",
      data: null,
    });
  }
};

// Admin Role Middleware
const adminMiddleware = (req, res, next) => {
  // Ensure user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Please log in.",
      data: null,
    });
  }

  // Check if the user has the admin role
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. This action requires admin role.",
      data: null,
    });
  }

  next(); // User has the correct role, proceed to next middleware/controller
};

// Export all middlewares in a single object
module.exports = {
  authMiddleware,
  adminMiddleware,
};
