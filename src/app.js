const express = require("express");
const path = require("path");
const fs = require("fs");
const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");
const userRoutes = require("./routes/user.routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { apiLimiter } = require("./middlewares/rateLimiter");

const app = express();

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Check if frontend build exists
const frontendDistPath = path.join(__dirname, "../frontend/dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");
const hasFrontendBuild = fs.existsSync(frontendIndexPath);

// Serve static files from React build (only if build exists)
if (process.env.NODE_ENV === "production" && hasFrontendBuild) {
  app.use(express.static(frontendDistPath));
}

// Apply general rate limiting
app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/user", userRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    deployment: "backend-only",
    mongodb: "connected"
  });
});

// API status endpoint
app.get("/", (req, res) => {
  res.json({
    message: "AI Caption Generator API",
    status: "running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      posts: "/api/posts", 
      user: "/api/user",
      health: "/health"
    },
    docs: "See README.md for API documentation"
  });
});

// Serve React app for any non-API routes (only if frontend build exists)
if (process.env.NODE_ENV === "production" && hasFrontendBuild) {
  app.get("*", (req, res) => {
    // Don't serve React app for API routes
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ message: "API route not found" });
    }
    res.sendFile(frontendIndexPath);
  });
} else {
  // 404 handler for non-API routes when no frontend build
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ message: "API route not found" });
    }
    res.status(404).json({ 
      message: "Frontend not available in this deployment",
      api_available: true,
      endpoints: ["/api/auth", "/api/posts", "/api/user", "/health"]
    });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "File too large" });
  }

  res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

module.exports = app;
