// Optimized image compression utility for faster processing
export async function compressImage(
  file,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.75
) {
  // Skip compression for already small images
  if (file.size < 500 * 1024) {
    // Less than 500KB
    return file;
  }

  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions (smaller for faster processing)
      let { width, height } = img;
      const aspectRatio = width / height;

      // More aggressive compression for speed
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          width = Math.min(maxWidth, width);
          height = width / aspectRatio;
        } else {
          height = Math.min(maxHeight, height);
          width = height * aspectRatio;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Optimize canvas settings for speed
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "medium"; // Balance between speed and quality

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, "image/jpeg", quality);
    };

    img.src = URL.createObjectURL(file);
  });
}

// File validation
export function validateImageFile(file, maxSizeMB = 10) {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxSize = maxSizeMB * 1024 * 1024;

  if (!validTypes.includes(file.type)) {
    throw new Error(
      "Invalid file type. Please upload JPEG, PNG, or WebP images."
    );
  }

  if (file.size > maxSize) {
    throw new Error(`File too large. Maximum size is ${maxSizeMB}MB.`);
  }

  return true;
}

// Password validation
export function validatePassword(password) {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (password.length < minLength) {
    throw new Error(`Password must be at least ${minLength} characters long.`);
  }

  if (!hasUpper || !hasLower || !hasNumber) {
    throw new Error("Password must contain uppercase, lowercase, and number.");
  }

  return true;
}

// Username validation
export function validateUsername(username) {
  const minLength = 3;
  const maxLength = 20;
  const validPattern = /^[a-zA-Z0-9_]+$/;

  if (username.length < minLength || username.length > maxLength) {
    throw new Error(
      `Username must be ${minLength}-${maxLength} characters long.`
    );
  }

  if (!validPattern.test(username)) {
    throw new Error(
      "Username can only contain letters, numbers, and underscores."
    );
  }

  return true;
}

// Debounce utility
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Format date utility
export function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
