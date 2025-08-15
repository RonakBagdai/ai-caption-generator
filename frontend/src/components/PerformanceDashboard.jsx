import { useState, useEffect } from "react";
import performanceTracker from "../utils/performanceTracker";

const PerformanceDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = () => {
      try {
        const summary = performanceTracker.getAnalyticsSummary();
        setAnalytics(summary);
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const clearData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all analytics data? This action cannot be undone."
      )
    ) {
      performanceTracker.clearAnalytics();
      setAnalytics(performanceTracker.getAnalyticsSummary());
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 dark:bg-gray-700 rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Unable to load analytics data
        </p>
      </div>
    );
  }

  const formatTime = (ms) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getPerformanceColor = (time) => {
    if (time < 2000) return "text-green-600 dark:text-green-400";
    if (time < 5000) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Performance Analytics
        </h3>
        <button
          onClick={clearData}
          className="text-xs text-red-600 dark:text-red-400 hover:underline"
        >
          Clear Data
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {analytics.totalEvents}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Events
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {analytics.captionGenerations.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Captions Generated
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {analytics.batchUploads.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Batch Uploads
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {analytics.errors.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Errors</div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Average Response Times
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Caption Generation
              </span>
              <span
                className={`text-sm font-medium ${getPerformanceColor(
                  analytics.averageCaptionTime
                )}`}
              >
                {formatTime(analytics.averageCaptionTime)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Batch Processing
              </span>
              <span
                className={`text-sm font-medium ${getPerformanceColor(
                  analytics.averageBatchTime
                )}`}
              >
                {formatTime(analytics.averageBatchTime)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Last 24 Hours
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {analytics.last24h} events
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Last 7 Days
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {analytics.lastWeek} events
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Errors */}
      {analytics.errors.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Recent Errors ({analytics.errors.length})
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {analytics.errors
              .slice(-5)
              .reverse()
              .map((error, index) => (
                <div
                  key={index}
                  className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-red-800 dark:text-red-300">
                      {error.message}
                    </span>
                    <span className="text-xs text-red-600 dark:text-red-400">
                      {new Date(error.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {error.context && (
                    <div className="text-red-700 dark:text-red-400">
                      Context: {error.context}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Page Views */}
      {analytics.pageViews.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Most Visited Pages
          </h4>
          <div className="space-y-2">
            {Object.entries(
              analytics.pageViews.reduce((acc, view) => {
                acc[view.page] = (acc[view.page] || 0) + 1;
                return acc;
              }, {})
            )
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([page, count]) => (
                <div key={page} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {page}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {count} visits
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Performance Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
          Performance Tips
        </h4>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Use batch upload for multiple images to save time</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>
              Compress large images before uploading for faster processing
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Clear browser cache if you experience slow loading</span>
          </li>
          {analytics.averageCaptionTime > 5000 && (
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 dark:text-yellow-400">⚠</span>
              <span>
                Your caption generation time is above average. Try using smaller
                images.
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
