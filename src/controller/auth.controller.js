const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

async function registerController(req, res) {
  const { username, password } = req.body;

  const existingUser = await userModel.findOne({ username });

  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  const user = await userModel.create({
    username,
    password: await bcrypt.hash(password, 10),
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Token expires in 1 hour
  });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production", // true in production over HTTPS
    maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
  });

  // Calculate expiry time for client info
  const expiryTime = new Date(Date.now() + 60 * 60 * 1000);

  return res.status(201).json({
    message: "User registered successfully",
    user: { _id: user._id, username: user.username },
    token: token, // Also return token in response for cross-origin scenarios
    tokenExpiry: expiryTime.toISOString(),
  });
}

async function loginController(req, res) {
  console.log("Login attempt for username:", req.body.username);
  const { username, password } = req.body;

  const user = await userModel.findOne({ username });
  if (!user) {
    console.log("User not found:", username);
    return res
      .status(401)
      .json({ message: "Invalid username or user not found" });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    console.log("Invalid password for user:", username);
    return res.status(401).json({ message: "Invalid password" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Token expires in 1 hour
  });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production", // true in production over HTTPS
    maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
  });

  // Calculate expiry time for client info
  const expiryTime = new Date(Date.now() + 60 * 60 * 1000);

  console.log("Login successful for user:", username);
  return res.status(200).json({
    message: "Login successful",
    user: { username: user.username, _id: user._id },
    token: token, // Also return token in response for cross-origin scenarios
    tokenExpiry: expiryTime.toISOString(),
  });
}

async function logoutController(req, res) {
  // Clear auth cookie; mirror options used when setting it
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // set true in production with HTTPS
  });
  return res.status(200).json({ message: "Logged out" });
}

module.exports = { registerController, loginController, logoutController };
