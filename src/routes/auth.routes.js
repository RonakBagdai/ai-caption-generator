const express = require("express");
const {
  registerController,
  loginController,
  logoutController,
} = require("../controller/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  authLimiter,
  userStatusLimiter,
} = require("../middlewares/rateLimiter");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../middlewares/validation");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const router = express.Router();

// Apply strict auth rate limiting only to login/register
router.post(
  "/register",
  authLimiter,
  validateRegisterInput,
  registerController
);
router.post("/login", authLimiter, validateLoginInput, loginController);
router.post("/logout", authMiddleware, logoutController);

// Apply more lenient rate limiting to user status check
router.get("/user", userStatusLimiter, async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ user: null, authenticated: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select("_id username");
    if (!user) return res.json({ user: null, authenticated: false });
    return res.json({ user, authenticated: true });
  } catch (e) {
    return res.json({ user: null, authenticated: false });
  }
});

module.exports = router;
