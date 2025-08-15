const rateLimit = require("express-rate-limit");

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs (more lenient for development)
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for auth endpoints (login/register only)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // allow 50 auth requests per 15 minutes (much more lenient for development)
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// More lenient rate limiting for user status checks
const userStatusLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 500, // allow 500 user status checks per minute (very generous for development)
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for post creation
const postLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // limit each IP to 3 posts per minute
  message: "Too many posts created, please wait before creating another.",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  userStatusLimiter,
  postLimiter,
};
