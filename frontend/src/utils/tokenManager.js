class TokenManager {
  constructor() {
    this.checkInterval = null;
    this.onTokenExpired = null;
  }

  // Initialize token expiry checking
  init(callbacks = {}) {
    // Prevent multiple initializations
    if (this.checkInterval) {
      console.log("Token manager already initialized, skipping...");
      return;
    }

    this.onTokenExpired = callbacks.onTokenExpired;

    // Check token expiry every minute using local storage
    this.checkInterval = setInterval(() => {
      this.checkLocalTokenExpiry();
    }, 60 * 1000); // Check every minute

    console.log(
      "Token manager initialized - checking local expiry every minute"
    );
  }

  // Check if token is expired based on stored expiry time
  checkLocalTokenExpiry() {
    const tokenExpiry = localStorage.getItem("tokenExpiry");

    if (!tokenExpiry) {
      console.log("No token expiry found in localStorage");
      return;
    }

    const expiryTime = new Date(tokenExpiry);
    const now = new Date();

    if (now >= expiryTime) {
      console.log(
        "Token expired based on local expiry time - logging out user"
      );
      this.handleTokenExpiry();
    }
  }

  // Handle token expiry
  handleTokenExpiry() {
    localStorage.removeItem("tokenExpiry"); // Clean up expired token info
    if (this.onTokenExpired) {
      this.onTokenExpired();
    }
  }

  // Destroy token manager
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.log("Token manager destroyed");
  }

  // Get time until next check (for debugging)
  getStatus() {
    return {
      isActive: !!this.checkInterval,
      checkIntervalMs: 60 * 1000,
      nextCheckIn: this.checkInterval ? "< 1 minute" : "Not running",
    };
  }
}

// Create singleton instance
const tokenManager = new TokenManager();

export default tokenManager;
