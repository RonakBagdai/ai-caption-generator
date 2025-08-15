class SessionManager {
  constructor() {
    this.warningTimeout = 5 * 60 * 1000; // Show warning 5 minutes before timeout
    this.activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    this.timeoutId = null;
    this.warningTimeoutId = null;
    this.lastActivity = Date.now();
    this.sessionStartTime = Date.now();
    this.isWarningShown = false;
    this.onLogout = null;
    this.onWarning = null;
    this.onActivityResume = null;
    this.isTabVisible = true;
    this.isInitialized = false; // Track initialization state

    // Set default settings first
    this.settings = {
      autoLogoutOnClose: false,
      sessionTimeout: 30,
      showWarnings: true,
      pauseWhenHidden: true,
    };

    // DO NOT SET sessionTimeout here - wait for proper initialization
    this.sessionTimeout = null;

    // Delay loading settings to ensure localStorage is available
    setTimeout(() => {
      this.loadSettings();
      this.sessionTimeout = this.settings.sessionTimeout * 60 * 1000;
      console.log(
        "SessionManager constructor complete - timeout:",
        this.sessionTimeout / 1000 / 60,
        "minutes"
      );
    }, 100);

    this.bindEvents();

    // Import performance tracker dynamically to avoid circular dependencies
    this.performanceTracker = null;
    this.initPerformanceTracker();

    console.log("SessionManager constructed, settings will load in 100ms...");
  }

  async initPerformanceTracker() {
    try {
      const { default: performanceTracker } = await import(
        "./performanceTracker.js"
      );
      this.performanceTracker = performanceTracker;
    } catch (e) {
      console.warn("Could not load performance tracker:", e);
    }
  }

  // Load settings from localStorage
  loadSettings() {
    console.log("Loading settings from localStorage...");
    const saved = localStorage.getItem("session_settings");
    console.log("Raw localStorage value:", saved);

    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        console.log("Parsed settings from localStorage:", parsedSettings);
        this.settings = { ...this.settings, ...parsedSettings };
        console.log("Merged settings:", this.settings);
        console.log(
          "Loaded session settings from localStorage - timeout will be:",
          this.settings.sessionTimeout,
          "minutes"
        );
      } catch (e) {
        console.error("Failed to parse session settings from localStorage:", e);
        console.log("Using default settings due to parse error");
      }
    } else {
      console.log(
        "No saved session settings found in localStorage, using defaults:",
        this.settings
      );
      // Save default settings to localStorage
      this.saveSettingsToStorage();
    }
  }

  // Helper method to save settings to localStorage without triggering timer reset
  saveSettingsToStorage() {
    try {
      localStorage.setItem("session_settings", JSON.stringify(this.settings));
      console.log("Settings saved to localStorage:", this.settings);
    } catch (e) {
      console.warn("Failed to save session settings:", e);
    }
  }

  // Save settings to localStorage
  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettingsToStorage();
    this.sessionTimeout = this.settings.sessionTimeout * 60 * 1000;
    console.log("Session settings updated:", this.settings);
    console.log(
      "Session timeout set to:",
      this.sessionTimeout / 1000 / 60,
      "minutes"
    );

    // Only reset timer if initialized
    if (this.isInitialized) {
      this.resetTimer();
    }
  }

  // Initialize session management
  init(callbacks = {}) {
    // Prevent multiple initializations
    if (this.isInitialized) {
      console.log(
        "Session manager already initialized, updating callbacks only"
      );
      this.onLogout = callbacks.onLogout || this.onLogout;
      this.onWarning = callbacks.onWarning || this.onWarning;
      this.onActivityResume =
        callbacks.onActivityResume || this.onActivityResume;
      return;
    }

    this.onLogout = callbacks.onLogout;
    this.onWarning = callbacks.onWarning;
    this.onActivityResume = callbacks.onActivityResume;

    // Wait for settings to be loaded, then initialize
    const waitForSettings = () => {
      if (this.sessionTimeout === null) {
        console.log("Waiting for settings to load...");
        setTimeout(waitForSettings, 50);
        return;
      }

      console.log(
        "Settings loaded, initializing session with timeout:",
        this.sessionTimeout / 1000 / 60,
        "minutes"
      );

      // Reset session start time and last activity
      this.sessionStartTime = Date.now();
      this.lastActivity = Date.now();

      // DO NOT start timer immediately - let user set their preferred timeout first
      // this.startTimer();
      this.trackPageUnload();
      this.trackVisibility();
      this.isInitialized = true;

      // Track session initialization
      if (this.performanceTracker) {
        this.performanceTracker.trackSessionEvent("initialized", this.settings);
      }

      console.log("Session manager initialized with settings:", this.settings);
      console.log(
        "Session timeout:",
        this.sessionTimeout / 1000 / 60,
        "minutes"
      );
      console.log(
        "Timer will NOT start automatically - use manual start or extend session"
      );
    };

    waitForSettings();
  }

  // Bind activity tracking events
  bindEvents() {
    // TEMPORARILY DISABLE ALL ACTIVITY HANDLERS TO PREVENT RESETS
    // Only bind essential events that shouldn't reset the timer
    console.log("Activity handlers disabled to prevent timer resets");

    // We'll only track meaningful activity that should extend the session
    // without constantly resetting the timer

    // Add minimal activity tracking that doesn't reset timer
    this.bindMinimalActivityTracking();
  }

  // Minimal activity tracking that doesn't reset the timer
  bindMinimalActivityTracking() {
    // Only update lastActivity without resetting timer
    const updateActivityOnly = () => {
      this.lastActivity = Date.now();
      // Do NOT reset timer here
    };

    // Bind to essential events only
    document.addEventListener("keypress", updateActivityOnly, true);
    document.addEventListener("click", updateActivityOnly, true);
  }

  // Handle mouse movement (heavily throttled)
  handleMouseMove() {
    // DISABLED - This was causing timer resets
    return;
  }

  // Handle user activity (disabled to prevent resets)
  handleActivity() {
    // DISABLED - This was causing timer resets
    return;
  }

  // Handle meaningful user activity (disabled to prevent resets)
  handleMeaningfulActivity() {
    // DISABLED - This was causing timer resets
    return;
  }

  // Start/restart the session timer
  startTimer() {
    this.clearTimers();

    if (!this.sessionTimeout || this.sessionTimeout <= 0) {
      console.warn("Invalid session timeout:", this.sessionTimeout);
      return;
    }

    console.log(
      "Starting session timer with timeout:",
      this.sessionTimeout / 1000 / 60,
      "minutes"
    );

    // Set warning timer
    if (
      this.settings.showWarnings &&
      this.warningTimeout < this.sessionTimeout
    ) {
      const warningTime = this.sessionTimeout - this.warningTimeout;
      console.log(
        "Setting warning timer for:",
        warningTime / 1000 / 60,
        "minutes"
      );
      this.warningTimeoutId = setTimeout(() => {
        this.showWarning();
      }, warningTime);
    }

    // Set logout timer
    this.timeoutId = setTimeout(() => {
      this.handleTimeout();
    }, this.sessionTimeout);
  }

  // Reset the session timer
  resetTimer() {
    if (this.isTabVisible || !this.settings.pauseWhenHidden) {
      this.startTimer();
    }
  }

  // Clear all timers
  clearTimers() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
      this.warningTimeoutId = null;
    }
  }

  // Show session timeout warning
  showWarning() {
    this.isWarningShown = true;
    if (this.onWarning) {
      const remainingTime = this.warningTimeout;
      this.onWarning(remainingTime);
    }
  }

  // Hide session timeout warning
  hideWarning() {
    this.isWarningShown = false;
  }

  // Handle session timeout
  handleTimeout() {
    console.log("Session timeout - logging out user");
    this.clearTimers();

    // Track session timeout
    if (this.performanceTracker) {
      this.performanceTracker.trackSessionEvent("timeout", {
        duration: Date.now() - this.lastActivity,
      });
    }

    if (this.onLogout) {
      this.onLogout("timeout");
    }
  }

  // Track page unload for auto-logout
  trackPageUnload() {
    if (!this.settings.autoLogoutOnClose) return;

    const handleUnload = () => {
      // Send logout request synchronously
      navigator.sendBeacon("/api/auth/logout");
      localStorage.removeItem("auth_token");
      sessionStorage.clear();
    };

    // Multiple events to catch different closing scenarios
    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("unload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    // Track tab/window close specifically
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && this.settings.autoLogoutOnClose) {
        // Small delay to distinguish between tab switch and close
        setTimeout(() => {
          if (document.hidden) {
            handleUnload();
          }
        }, 1000);
      }
    });
  }

  // Track tab visibility for pausing session
  trackVisibility() {
    document.addEventListener("visibilitychange", () => {
      this.isTabVisible = !document.hidden;

      if (this.settings.pauseWhenHidden) {
        if (this.isTabVisible) {
          // Resume timer when tab becomes visible
          this.resetTimer();
          console.log("Tab visible - session timer resumed");
        } else {
          // Pause timer when tab is hidden
          this.clearTimers();
          console.log("Tab hidden - session timer paused");
        }
      }
    });
  }

  // Extend session (called when user chooses to stay)
  extendSession() {
    this.lastActivity = Date.now();
    this.hideWarning();

    // Only start timer if not already running
    if (!this.timeoutId) {
      console.log("Starting session timer for the first time");
      this.startTimer();
    } else {
      console.log("Extending existing session timer");
      this.resetTimer();
    }

    console.log(
      "Session extended - timeout:",
      this.sessionTimeout / 1000 / 60,
      "minutes"
    );

    // Track session extension
    if (this.performanceTracker) {
      this.performanceTracker.trackSessionEvent("extended", {
        newTimeout: this.sessionTimeout,
      });
    }
  }

  // Start session timer manually
  startSession() {
    if (!this.isInitialized) {
      console.warn("Cannot start session - not initialized yet");
      return;
    }

    if (this.timeoutId) {
      console.log("Session already running");
      return;
    }

    console.log(
      "Starting session manually with timeout:",
      this.sessionTimeout / 1000 / 60,
      "minutes"
    );
    this.lastActivity = Date.now();
    this.startTimer();
  }

  // Manual logout
  logout() {
    this.clearTimers();
    if (this.onLogout) {
      this.onLogout("manual");
    }
  }

  // Get session info
  getSessionInfo() {
    const now = Date.now();
    const timeUntilExpiry = this.timeoutId
      ? this.lastActivity + this.sessionTimeout - now
      : 0;

    return {
      lastActivity: this.lastActivity,
      timeUntilExpiry: Math.max(0, timeUntilExpiry),
      isWarningShown: this.isWarningShown,
      isActive: !!this.timeoutId,
      settings: this.settings,
    };
  }

  // Destroy session manager
  destroy() {
    this.clearTimers();
    this.isInitialized = false;

    // Remove minimal event listeners
    const updateActivityOnly = () => {
      this.lastActivity = Date.now();
    };

    document.removeEventListener("keypress", updateActivityOnly, true);
    document.removeEventListener("click", updateActivityOnly, true);

    console.log("Session manager destroyed");
  }

  // Check if session is still valid (for API calls)
  isSessionValid() {
    const now = Date.now();
    return now - this.lastActivity < this.sessionTimeout;
  }

  // Update session on successful API calls
  updateLastActivity() {
    this.lastActivity = Date.now();
  }

  // Set session timeout manually (for debugging/testing)
  setSessionTimeout(minutes) {
    console.log(
      "Manual session timeout change from",
      this.settings.sessionTimeout,
      "to",
      minutes,
      "minutes"
    );
    this.settings.sessionTimeout = minutes;
    this.sessionTimeout = minutes * 60 * 1000;
    this.saveSettings(this.settings);
    console.log("Session timeout manually set to:", minutes, "minutes");
  }

  // Force reload settings from localStorage (useful for debugging)
  reloadSettings() {
    console.log("Force reloading settings...");
    this.loadSettings();
    this.sessionTimeout = this.settings.sessionTimeout * 60 * 1000;
    if (this.isInitialized) {
      this.resetTimer();
    }
    console.log(
      "Settings reloaded - new timeout:",
      this.sessionTimeout / 1000 / 60,
      "minutes"
    );
  }

  // Debug method to check settings persistence
  debugSettings() {
    console.log("=== Session Manager Debug ===");
    console.log("Current settings:", this.settings);
    console.log("Current sessionTimeout (ms):", this.sessionTimeout);
    console.log(
      "Current sessionTimeout (min):",
      this.sessionTimeout / 1000 / 60
    );
    console.log(
      "localStorage settings:",
      localStorage.getItem("session_settings")
    );
    console.log("Is initialized:", this.isInitialized);
    console.log("Time until expiry:", this.getSessionInfo().timeUntilExpiry);
    console.log("=============================");
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

export default sessionManager;
