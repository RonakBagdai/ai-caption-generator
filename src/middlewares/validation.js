// Input validation helpers
const validator = require("validator");

function validateRegisterInput(req, res, next) {
  const { username, password } = req.body;
  const errors = [];

  // Username validation
  if (!username || typeof username !== "string") {
    errors.push("Username is required");
  } else if (username.length < 3 || username.length > 20) {
    errors.push("Username must be 3-20 characters long");
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push("Username can only contain letters, numbers, and underscores");
  }

  // Password validation
  if (!password || typeof password !== "string") {
    errors.push("Password is required");
  } else if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.push("Password must contain uppercase, lowercase, and number");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors,
    });
  }

  // Sanitize inputs - Don't escape username, just trim it
  req.body.username = username.trim();
  req.body.password = password; // Don't escape password

  next();
}

function validateLoginInput(req, res, next) {
  const { username, password } = req.body;
  const errors = [];

  if (!username || typeof username !== "string") {
    errors.push("Username is required");
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors,
    });
  }

  // Sanitize username - Don't escape, just trim
  req.body.username = username.trim();

  next();
}

function validatePostInput(req, res, next) {
  const { vibe, extraPrompt } = req.body;
  const errors = [];

  // Validate file exists
  if (!req.file) {
    errors.push("Image file is required");
  } else {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      errors.push("Invalid file type. Only JPEG, PNG, and WebP are allowed");
    }

    // Validate file size (4MB)
    if (req.file.size > 4 * 1024 * 1024) {
      errors.push("File too large. Maximum size is 4MB");
    }
  }

  // Validate vibe
  const allowedVibes = [
    "Fun",
    "Professional",
    "Dramatic",
    "Minimal",
    "Adventurous",
    "Wholesome",
  ];
  if (vibe && !allowedVibes.includes(vibe)) {
    errors.push("Invalid vibe selection");
  }

  // Validate extra prompt
  if (extraPrompt && extraPrompt.length > 500) {
    errors.push("Additional prompt must be less than 500 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors,
    });
  }

  // Sanitize inputs
  if (vibe) req.body.vibe = validator.escape(vibe);
  if (extraPrompt) req.body.extraPrompt = validator.escape(extraPrompt.trim());

  next();
}

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  validatePostInput,
};
