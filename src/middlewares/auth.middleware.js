const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

async function authMiddleware(req, res, next) {
  // Try to get token from multiple sources
  let token = req.cookies.token;
  
  // If no cookie token, try Authorization header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  // If still no token, try x-auth-token header
  if (!token) {
    token = req.headers['x-auth-token'];
  }

  if (!token) {
    return res.status(401).json({ 
      message: "Unauthorized",
      code: "NO_TOKEN",
      debug: {
        hasCookie: !!req.cookies.token,
        hasAuthHeader: !!req.headers.authorization,
        hasXAuthToken: !!req.headers['x-auth-token']
      }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel
      .findById(decoded.id)
      .select("_id username")
      .lean();

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token",
        code: "INVALID_TOKEN",
      });
    }
    return res.status(401).json({
      message: "Authentication failed",
      code: "AUTH_FAILED",
    });
  }
}

module.exports = authMiddleware;
