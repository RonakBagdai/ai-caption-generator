class PerformanceTracker {
  constructor() {
    this.metrics = new Map();
    this.sessionStart = Date.now();
  }

  // Track timing metrics
  startTimer(name) {
    this.metrics.set(`${name}_start`, performance.now());
  }

  endTimer(name) {
    const startTime = this.metrics.get(`${name}_start`);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics.set(name, duration);
      this.metrics.delete(`${name}_start`);
      return duration;
    }
    return null;
  }

  // Track user interactions
  trackEvent(event, data = {}) {
    const timestamp = Date.now();
    const eventData = {
      event,
      timestamp,
      sessionTime: timestamp - this.sessionStart,
      ...data,
    };

    // Store in localStorage for basic analytics
    const events = this.getStoredEvents();
    events.push(eventData);

    // Keep only last 100 events to prevent storage bloat
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }

    localStorage.setItem("app_analytics", JSON.stringify(events));

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log("Performance Event:", eventData);
    }
  }

  // Track page visits
  trackPageView(page) {
    this.trackEvent("page_view", { page });
  }

  // Track caption generation
  trackCaptionGeneration(data) {
    this.startTimer("caption_generation");
    this.trackEvent("caption_generation_start", data);
  }

  completeCaptionGeneration(success = true, data = {}) {
    const duration = this.endTimer("caption_generation");
    this.trackEvent("caption_generation_complete", {
      success,
      duration,
      ...data,
    });
  }

  // Track batch upload
  trackBatchUpload(fileCount) {
    this.startTimer("batch_upload");
    this.trackEvent("batch_upload_start", { fileCount });
  }

  completeBatchUpload(results) {
    const duration = this.endTimer("batch_upload");
    this.trackEvent("batch_upload_complete", {
      duration,
      totalFiles: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    });
  }

  // Track user preferences
  trackPreferenceChange(preference, value) {
    this.trackEvent("preference_change", { preference, value });
  }

  // Track session events
  trackSessionEvent(eventType, data = {}) {
    this.trackEvent(`session_${eventType}`, data);
  }

  // Track login/logout
  trackAuthentication(action, method = "form") {
    this.trackEvent("authentication", { action, method });
  }

  // Track errors
  trackError(error, context = "") {
    this.trackEvent("error", {
      message: error.message,
      stack: error.stack?.substring(0, 200), // Truncate stack trace
      context,
    });
  }

  // Get stored events
  getStoredEvents() {
    try {
      const stored = localStorage.getItem("app_analytics");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  // Get basic analytics summary
  getAnalyticsSummary() {
    const events = this.getStoredEvents();
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    const last24h = events.filter((e) => now - e.timestamp < oneDay);
    const lastWeek = events.filter((e) => now - e.timestamp < oneWeek);

    return {
      totalEvents: events.length,
      last24h: last24h.length,
      lastWeek: lastWeek.length,
      pageViews: events.filter((e) => e.event === "page_view"),
      captionGenerations: events.filter(
        (e) => e.event === "caption_generation_complete"
      ),
      batchUploads: events.filter((e) => e.event === "batch_upload_complete"),
      errors: events.filter((e) => e.event === "error"),
      averageCaptionTime: this.getAverageTime("caption_generation_complete"),
      averageBatchTime: this.getAverageTime("batch_upload_complete"),
    };
  }

  getAverageTime(eventType) {
    const events = this.getStoredEvents().filter(
      (e) => e.event === eventType && e.duration
    );

    if (events.length === 0) return 0;

    const totalTime = events.reduce((sum, e) => sum + e.duration, 0);
    return Math.round(totalTime / events.length);
  }

  // Clear analytics data
  clearAnalytics() {
    localStorage.removeItem("app_analytics");
    this.metrics.clear();
  }

  // Track resource loading performance
  trackResourcePerformance() {
    if (typeof window !== "undefined" && window.performance) {
      const navigation = performance.getEntriesByType("navigation")[0];
      if (navigation) {
        this.trackEvent("page_load_performance", {
          domContentLoaded:
            navigation.domContentLoadedEventEnd -
            navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: this.getFirstPaintTime(),
          firstContentfulPaint: this.getFirstContentfulPaintTime(),
        });
      }
    }
  }

  getFirstPaintTime() {
    try {
      const paintEntries = performance.getEntriesByType("paint");
      const firstPaint = paintEntries.find(
        (entry) => entry.name === "first-paint"
      );
      return firstPaint ? firstPaint.startTime : null;
    } catch (e) {
      return null;
    }
  }

  getFirstContentfulPaintTime() {
    try {
      const paintEntries = performance.getEntriesByType("paint");
      const firstContentfulPaint = paintEntries.find(
        (entry) => entry.name === "first-contentful-paint"
      );
      return firstContentfulPaint ? firstContentfulPaint.startTime : null;
    } catch (e) {
      return null;
    }
  }
}

// Create global instance
const performanceTracker = new PerformanceTracker();

// Auto-track page load performance
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    performanceTracker.trackResourcePerformance();
  });

  // Track navigation performance
  if ("PerformanceObserver" in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === "navigation") {
            performanceTracker.trackEvent("navigation_timing", {
              loadTime: entry.loadEventEnd - entry.loadEventStart,
              domContentLoadedTime:
                entry.domContentLoadedEventEnd -
                entry.domContentLoadedEventStart,
              responseTime: entry.responseEnd - entry.requestStart,
            });
          }
        });
      });
      observer.observe({ entryTypes: ["navigation"] });
    } catch (e) {
      // PerformanceObserver not supported
    }
  }
}

export default performanceTracker;
